"""Construction de la transaction d'ordre (Mode Manuel).

Devnet : à défaut de liquidité DEX fiable, un ordre manuel exécute un vrai **wrap SOL → wSOL**
signé par l'utilisateur (jambe d'achat, fonds conservés par l'utilisateur, réellement broadcastable
et suivable on-chain). C'est le point d'intégration où brancher les instructions de swap Jupiter.
"""
from __future__ import annotations

from solders.pubkey import Pubkey
from solders.system_program import TransferParams as SysTransferParams
from solders.system_program import transfer as sys_transfer
from spl.token.constants import TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT
from spl.token.instructions import (
    SyncNativeParams,
    create_associated_token_account,
    get_associated_token_address,
    sync_native,
)

from app.solana.client import SolanaClient
from app.solana.tx import build_unsigned_tx_b64


async def build_manual_order_tx(*, owner: str, input_amount: int) -> tuple[str, dict]:
    """Renvoie (tx non signée base64, route) pour un ordre manuel SOL→wSOL."""
    client = SolanaClient()
    try:
        owner_pk = Pubkey.from_string(owner)
        wsol = WRAPPED_SOL_MINT
        ata = get_associated_token_address(owner_pk, wsol)

        ixs = []
        steps: list[str] = []
        if not await client.account_exists(str(ata)):
            ixs.append(create_associated_token_account(payer=owner_pk, owner=owner_pk, mint=wsol))
            steps.append("create_associated_token_account")

        ixs.append(
            sys_transfer(SysTransferParams(from_pubkey=owner_pk, to_pubkey=ata, lamports=input_amount))
        )
        steps.append("system_transfer")
        ixs.append(sync_native(SyncNativeParams(program_id=TOKEN_PROGRAM_ID, account=ata)))
        steps.append("sync_native")

        blockhash = await client.get_latest_blockhash()
        unsigned = build_unsigned_tx_b64(ixs, owner_pk, blockhash)
        route = {
            "kind": "wrap_sol",
            "note": "devnet placeholder for a DEX swap (Jupiter integration point)",
            "steps": steps,
            "wsol_ata": str(ata),
        }
        return unsigned, route
    finally:
        await client.close()
