from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os
import asyncio
import httpx
import requests as req

from sniping.router import router as sniping_router
from news.router import router as news_router

load_dotenv()

app = FastAPI()

# CORS — permet à l'app Expo (web) d'appeler l'API en développement.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sniping_router)
app.include_router(news_router)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


JUPITER_API = "https://api.jup.ag/swap/v1"
SOL_MINT = "So11111111111111111111111111111111111111112"

SOL_RPCS = [
    "https://rpc.ankr.com/solana",
    "https://api.mainnet-beta.solana.com",
    "https://solana-mainnet.rpc.extrnode.com",
]

RPC_HEADERS = {"Content-Type": "application/json"}


async def solana_rpc(method: str, params: list):
    """Call all Solana RPCs in parallel, return first successful result."""
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}

    async def try_rpc(client: httpx.AsyncClient, url: str):
        res = await client.post(url, json=payload, headers=RPC_HEADERS)
        data = res.json()
        if res.status_code == 200 and "result" in data and data["result"] is not None:
            return data["result"]
        return None

    async with httpx.AsyncClient(timeout=8.0, verify=False) as client:
        tasks = [asyncio.create_task(try_rpc(client, rpc)) for rpc in SOL_RPCS]
        for coro in asyncio.as_completed(tasks):
            try:
                result = await coro
                if result is not None:
                    for t in tasks:
                        t.cancel()
                    return result
            except Exception:
                continue

    raise HTTPException(status_code=502, detail="All Solana RPCs failed")


class WalletAuthRequest(BaseModel):
    wallet_address: str
    wallet_type: str  # "phantom" or "evm"


class SwapTransactionRequest(BaseModel):
    output_mint: str
    amount_lamports: int
    user_public_key: str
    slippage_bps: int = 300


@app.get("/")
def read_root():
    return {
        "hello": "world",
        "supabase_configured": SUPABASE_URL is not None
    }


@app.get("/health")
def health():
    """Keep-alive endpoint — pinged every 3 days to prevent Supabase from pausing."""
    supabase = get_supabase()
    supabase.table("profiles").select("wallet_address").limit(1).execute()
    return {"status": "ok"}


@app.post("/auth/wallet")
def auth_wallet(request: WalletAuthRequest):
    """
    Authenticate a user by wallet address.
    Creates a new profile if the address is not registered yet.
    """
    supabase = get_supabase()

    result = supabase.table("profiles") \
        .select("*") \
        .eq("wallet_address", request.wallet_address) \
        .execute()

    if result.data:
        return {"user": result.data[0], "is_new": False}

    new_profile = {
        "wallet_address": request.wallet_address,
        "wallet_type": request.wallet_type,
    }
    created = supabase.table("profiles").insert(new_profile).execute()

    if not created.data:
        raise HTTPException(status_code=500, detail="Failed to create profile")

    return {"user": created.data[0], "is_new": True}


@app.post("/swap/transaction")
def get_swap_transaction(request: SwapTransactionRequest):
    """
    Proxy Jupiter API: quote + swap transaction.
    Évite les restrictions réseau mobile en faisant l'appel côté serveur.
    """
    try:
        # 1. Quote
        quote_res = req.get(f"{JUPITER_API}/quote", params={
            "inputMint": SOL_MINT,
            "outputMint": request.output_mint,
            "amount": request.amount_lamports,
            "slippageBps": request.slippage_bps,
            "asLegacyTransaction": "true",
        }, timeout=15)
        if quote_res.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Jupiter quote failed ({quote_res.status_code}): {quote_res.text}")
        quote = quote_res.json()

        # 2. Swap transaction
        swap_res = req.post(f"{JUPITER_API}/swap", json={
            "quoteResponse": quote,
            "userPublicKey": request.user_public_key,
            "wrapAndUnwrapSol": True,
            "dynamicComputeUnitLimit": True,
            "prioritizationFeeLamports": "auto",
            "asLegacyTransaction": True,
        }, timeout=15)
        if swap_res.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Jupiter swap failed ({swap_res.status_code}): {swap_res.text}")

        data = swap_res.json()
        # V6 retourne "swapTransaction", V1 retourne "transaction"
        swap_tx = data.get("swapTransaction") or data.get("transaction")
        if not swap_tx:
            raise HTTPException(status_code=502, detail=f"No transaction in Jupiter response: {data}")

        return {
            "swap_transaction": swap_tx,
            "quote": quote,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/solana/signatures/{address}")
async def get_solana_signatures(address: str, limit: int = 20):
    """Proxy getSignaturesForAddress — avoids mobile RPC rate limits."""
    result = await solana_rpc("getSignaturesForAddress", [address, {"limit": limit}])
    return {"signatures": result}


@app.get("/solana/transaction/{signature}")
async def get_solana_transaction(signature: str):
    """Proxy getParsedTransaction — avoids mobile RPC rate limits."""
    result = await solana_rpc(
        "getTransaction",
        [signature, {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0}],
    )
    return {"transaction": result}
