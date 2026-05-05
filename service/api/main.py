from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os

from sniping.router import router as sniping_router

load_dotenv()

app = FastAPI()
app.include_router(sniping_router)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


class WalletAuthRequest(BaseModel):
    wallet_address: str
    wallet_type: str  # "phantom" or "evm"


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
