"""Client RPC Solana (devnet) — blockhash, envoi de transaction, suivi de statut, solde.

Fin wrapper autour de `solana.rpc.async_api.AsyncClient`. Instancié à la demande pour ne pas
ouvrir de connexion à l'import (les tests unitaires n'ont pas besoin du réseau).
"""
from __future__ import annotations

from dataclasses import dataclass

from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from solders.signature import Signature

from app.core.config import settings


@dataclass
class TxStatus:
    found: bool
    status: str          # pending | success | failed
    confirmations: str | None  # processed | confirmed | finalized | None
    err: str | None


class SolanaClient:
    def __init__(self, rpc_url: str | None = None) -> None:
        self.rpc_url = rpc_url or settings.solana_rpc_url
        self._client = AsyncClient(self.rpc_url)

    async def close(self) -> None:
        await self._client.close()

    async def __aenter__(self) -> "SolanaClient":
        return self

    async def __aexit__(self, *_exc) -> None:
        await self.close()

    async def get_latest_blockhash(self) -> str:
        resp = await self._client.get_latest_blockhash()
        return str(resp.value.blockhash)

    async def get_balance(self, address: str) -> int:
        resp = await self._client.get_balance(Pubkey.from_string(address))
        return resp.value

    async def send_raw_transaction(self, raw_tx: bytes) -> str:
        """Broadcast une transaction déjà signée (bytes) ; renvoie la signature."""
        resp = await self._client.send_raw_transaction(raw_tx)
        return str(resp.value)

    async def get_signature_status(self, signature: str) -> TxStatus:
        sig = Signature.from_string(signature)
        resp = await self._client.get_signature_statuses([sig], search_transaction_history=True)
        info = resp.value[0]
        if info is None:
            return TxStatus(found=False, status="pending", confirmations=None, err=None)
        if info.err is not None:
            return TxStatus(
                found=True, status="failed",
                confirmations=str(info.confirmation_status), err=str(info.err),
            )
        confirmed = str(info.confirmation_status) if info.confirmation_status else None
        # 'confirmed' ou 'finalized' => succès on-chain ; 'processed' => encore en vol.
        is_success = confirmed in ("confirmed", "finalized", "TransactionConfirmationStatus.Confirmed", "TransactionConfirmationStatus.Finalized")
        return TxStatus(
            found=True,
            status="success" if is_success else "pending",
            confirmations=confirmed,
            err=None,
        )

    async def account_exists(self, address: str) -> bool:
        resp = await self._client.get_account_info(Pubkey.from_string(address))
        return resp.value is not None

    async def get_token_account_balance(self, address: str) -> int:
        """Solde d'un compte de token SPL (base units). 0 si le compte n'existe pas."""
        try:
            resp = await self._client.get_token_account_balance(Pubkey.from_string(address))
        except Exception:  # noqa: BLE001 — compte inexistant / non-token
            return 0
        return int(resp.value.amount)

    async def request_airdrop(self, address: str, lamports: int) -> str:
        resp = await self._client.request_airdrop(Pubkey.from_string(address), lamports)
        return str(resp.value)
