"""
Snipe coordinator. Orchestrates: validate → consume budget atomically → execute.

The dry-run path is the only execution implemented today. Wiring to Jupiter /
Raydium swaps must use `wallet.load_keypair` to sign with the side wallet, and
must surface failures back to the caller so the budget can be refunded.
"""
import secrets
from typing import TYPE_CHECKING

from .permit import now_utc
from .solana_client import is_valid_solana_address

if TYPE_CHECKING:
    from .storage import InMemoryStore


class SnipeError(Exception):
    pass


def try_snipe(
    store: "InMemoryStore",
    permit_id: str,
    token_mint: str,
    amount_lamports: int,
    *,
    dry_run: bool = True,
) -> dict:
    if amount_lamports <= 0:
        raise SnipeError("amount_lamports must be positive")
    if not is_valid_solana_address(token_mint):
        raise SnipeError(f"invalid token mint: {token_mint}")
    if not dry_run:
        # Refuse BEFORE touching the budget: consuming-then-failing would burn
        # the user's budget for an op that never happened. The real swap path
        # must consume *and* be prepared to refund on failure.
        raise SnipeError(
            "real swap path not implemented yet; set SHADE_DRY_RUN=true"
        )

    permit = store.consume_permit(permit_id, amount_lamports)

    record = {
        "id": secrets.token_hex(16),
        "user_wallet": permit.user_wallet,
        "permit_id": permit.id,
        "side_wallet_address": permit.side_wallet_address,
        "token_mint": token_mint,
        "amount_lamports": amount_lamports,
        "tx_signature": f"DRYRUN-{secrets.token_hex(8)}",
        "status": "dry_run",
        "created_at": now_utc().isoformat(),
    }
    store.record_snipe(record)
    return record
