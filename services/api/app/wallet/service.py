"""Backend de délégation SPL (Approve / Revoke / exécution déléguée) — voir ADR 0001.

L'interface publique (`build_approve_tx`, `build_revoke_tx`, `execute_delegated_transfer`) est
stable : une future implémentation « Anchor vault » l'exposerait à l'identique, sans toucher aux
routers orders/copytrade/sniping.
"""
from __future__ import annotations

from dataclasses import dataclass

from solders.pubkey import Pubkey
from solders.system_program import TransferParams as SysTransferParams
from solders.system_program import transfer as sys_transfer
from spl.token.constants import TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT
from spl.token.instructions import (
    ApproveParams,
    RevokeParams,
    SyncNativeParams,
    TransferParams as SplTransferParams,
    approve,
    create_associated_token_account,
    get_associated_token_address,
    revoke,
    sync_native,
    transfer as spl_transfer,
)

from app.solana.client import SolanaClient
from app.solana.tx import build_signed_tx_bytes, build_unsigned_tx_b64
from app.wallet.side_wallet import load_side_wallet


@dataclass
class PreparedApprove:
    unsigned_tx_b64: str
    token_account: str  # ATA de l'utilisateur qui sera approuvé
    delegate: str       # side wallet (délégataire)
    amount: int
    mint: str


class SplDelegationBackend:
    async def build_approve_tx(
        self, *, owner: str, mint: str, amount: int, wrap_sol: bool = False
    ) -> PreparedApprove:
        """Construit la tx `Approve` NON signée (l'utilisateur la signe dans son wallet).

        Enchaîne, si nécessaire : création de l'ATA, wrap SOL→wSOL, puis `Approve(delegate, amount)`.
        """
        client = SolanaClient()
        try:
            owner_pk = Pubkey.from_string(owner)
            mint_pk = Pubkey.from_string(mint)
            delegate_pk = load_side_wallet().pubkey()
            ata = get_associated_token_address(owner_pk, mint_pk)

            ixs = []
            if not await client.account_exists(str(ata)):
                ixs.append(
                    create_associated_token_account(payer=owner_pk, owner=owner_pk, mint=mint_pk)
                )

            if wrap_sol and str(mint_pk) == str(WRAPPED_SOL_MINT):
                # Transfère `amount` lamports vers l'ATA wSOL puis synchronise le solde SPL.
                ixs.append(
                    sys_transfer(
                        SysTransferParams(from_pubkey=owner_pk, to_pubkey=ata, lamports=amount)
                    )
                )
                ixs.append(sync_native(SyncNativeParams(program_id=TOKEN_PROGRAM_ID, account=ata)))

            ixs.append(
                approve(
                    ApproveParams(
                        program_id=TOKEN_PROGRAM_ID,
                        source=ata,
                        delegate=delegate_pk,
                        owner=owner_pk,
                        amount=amount,
                        signers=[],
                    )
                )
            )

            blockhash = await client.get_latest_blockhash()
            unsigned = build_unsigned_tx_b64(ixs, owner_pk, blockhash)
            return PreparedApprove(
                unsigned_tx_b64=unsigned,
                token_account=str(ata),
                delegate=str(delegate_pk),
                amount=amount,
                mint=mint,
            )
        finally:
            await client.close()

    async def build_revoke_tx(self, *, owner: str, token_account: str) -> str:
        """Construit la tx `Revoke` NON signée (souveraineté utilisateur, on-chain)."""
        client = SolanaClient()
        try:
            owner_pk = Pubkey.from_string(owner)
            ata_pk = Pubkey.from_string(token_account)
            ix = revoke(
                RevokeParams(program_id=TOKEN_PROGRAM_ID, account=ata_pk, owner=owner_pk, signers=[])
            )
            blockhash = await client.get_latest_blockhash()
            return build_unsigned_tx_b64([ix], owner_pk, blockhash)
        finally:
            await client.close()

    async def execute_delegated_transfer(
        self, *, source_ata: str, mint: str, amount: int, destination_owner: str | None = None
    ) -> str:
        """Le side wallet (delegate) dépense `amount` depuis l'ATA utilisateur, dans la limite approuvée.

        C'est la jambe d'exécution réelle en Degen / Full Trust : le `spl-token` program refuse
        on-chain tout montant au-delà de l'allowance. Dans une intégration DEX, on remplacerait ce
        transfert par les instructions de swap (Jupiter) signées par le delegate — l'enforcement
        on-chain de l'allowance reste identique.
        """
        side = load_side_wallet()
        client = SolanaClient()
        try:
            mint_pk = Pubkey.from_string(mint)
            source_pk = Pubkey.from_string(source_ata)
            dest_owner_pk = (
                Pubkey.from_string(destination_owner) if destination_owner else side.pubkey()
            )
            dest_ata = get_associated_token_address(dest_owner_pk, mint_pk)

            ixs = []
            if not await client.account_exists(str(dest_ata)):
                ixs.append(
                    create_associated_token_account(
                        payer=side.pubkey(), owner=dest_owner_pk, mint=mint_pk
                    )
                )
            ixs.append(
                spl_transfer(
                    SplTransferParams(
                        program_id=TOKEN_PROGRAM_ID,
                        source=source_pk,
                        dest=dest_ata,
                        owner=side.pubkey(),  # autorité = delegate (pas l'owner)
                        amount=amount,
                        signers=[],
                    )
                )
            )
            blockhash = await client.get_latest_blockhash()
            raw = build_signed_tx_bytes(ixs, [side], side.pubkey(), blockhash)
            return await client.send_raw_transaction(raw)
        finally:
            await client.close()


# Singleton : point d'injection unique de la stratégie de délégation.
delegation_backend = SplDelegationBackend()
