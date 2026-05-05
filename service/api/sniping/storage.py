"""
In-memory store. Single source of truth for side wallets, permits, and snipe history.

Designed to be replaced by a Supabase-backed store later — same method surface.
The locking here is intentionally coarse: it guarantees the budget-consumption
invariant under concurrent FastAPI workers within a single process. For multi-
process deployments, swap in a database with row-level locks.
"""
import threading
from dataclasses import replace
from typing import Optional

from .permit import Permit, check_can_consume, now_utc


class StorageError(Exception):
    pass


class InMemoryStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._side_wallets: dict[str, dict] = {}
        self._permits: dict[str, Permit] = {}
        self._snipes: list[dict] = []

    # --- side wallets ---

    def create_side_wallet(
        self, user_wallet: str, address: str, encrypted_key: str
    ) -> dict:
        with self._lock:
            if user_wallet in self._side_wallets:
                raise StorageError(
                    f"side wallet already exists for user {user_wallet}"
                )
            record = {
                "user_wallet": user_wallet,
                "address": address,
                "encrypted_key": encrypted_key,
                "created_at": now_utc(),
            }
            self._side_wallets[user_wallet] = record
            return record

    def get_side_wallet(self, user_wallet: str) -> Optional[dict]:
        with self._lock:
            return self._side_wallets.get(user_wallet)

    # --- permits ---

    def save_permit(self, permit: Permit) -> None:
        with self._lock:
            self._permits[permit.id] = permit

    def get_permit(self, permit_id: str) -> Optional[Permit]:
        with self._lock:
            return self._permits.get(permit_id)

    def list_permits(self, user_wallet: str) -> list[Permit]:
        with self._lock:
            return [p for p in self._permits.values() if p.user_wallet == user_wallet]

    def consume_permit(self, permit_id: str, amount_lamports: int) -> Permit:
        """Atomic: validate then increment used budget. Raises on violation."""
        with self._lock:
            p = self._permits.get(permit_id)
            if p is None:
                raise StorageError(f"permit {permit_id} not found")
            check_can_consume(p, amount_lamports)
            updated = replace(
                p, budget_lamports_used=p.budget_lamports_used + amount_lamports
            )
            self._permits[permit_id] = updated
            return updated

    def revoke_permit(self, permit_id: str) -> Permit:
        with self._lock:
            p = self._permits.get(permit_id)
            if p is None:
                raise StorageError(f"permit {permit_id} not found")
            if p.revoked_at is not None:
                return p
            updated = replace(p, revoked_at=now_utc())
            self._permits[permit_id] = updated
            return updated

    # --- snipes ---

    def record_snipe(self, snipe: dict) -> None:
        with self._lock:
            self._snipes.append(dict(snipe))

    def list_snipes(self, user_wallet: str) -> list[dict]:
        with self._lock:
            return [dict(s) for s in self._snipes if s["user_wallet"] == user_wallet]


_default_store = InMemoryStore()


def get_store() -> InMemoryStore:
    return _default_store
