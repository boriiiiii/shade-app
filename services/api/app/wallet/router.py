"""Routes de délégation (SPL Approve/Revoke) + infos side wallet."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_user
from app.common.audit import record_audit
from app.core.config import settings
from app.core.constants import AuditDecision, DelegationStatus, ExecutionMode
from app.db.models import Delegation, User
from app.db.session import get_db
from app.solana.client import SolanaClient
from app.wallet.schemas import (
    ConfirmDelegationRequest,
    DelegationOut,
    PrepareDelegationRequest,
    PreparedDelegationOut,
    RevokeOut,
    SideWalletOut,
)
from app.wallet.service import delegation_backend
from app.wallet.side_wallet import SideWalletNotConfigured, load_side_wallet

router = APIRouter(prefix="/wallet", tags=["wallet"])

_DELEGATED_MODES = {ExecutionMode.degen.value, ExecutionMode.full_trust.value}


@router.get("/side-wallet", response_model=SideWalletOut)
async def side_wallet_info() -> SideWalletOut:
    try:
        pubkey = str(load_side_wallet().pubkey())
    except SideWalletNotConfigured as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))
    client = SolanaClient()
    try:
        balance = await client.get_balance(pubkey)
    finally:
        await client.close()
    return SideWalletOut(pubkey=pubkey, balance_lamports=balance, network=settings.solana_network)


@router.post("/delegations/prepare", response_model=PreparedDelegationOut)
async def prepare_delegation(
    req: PrepareDelegationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PreparedDelegationOut:
    if req.mode.value not in _DELEGATED_MODES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "La délégation ne concerne que degen / full_trust"
        )
    mint = req.mint or settings.default_delegation_mint
    try:
        prepared = await delegation_backend.build_approve_tx(
            owner=user.wallet_address, mint=mint, amount=req.amount, wrap_sol=req.wrap_sol
        )
    except SideWalletNotConfigured as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc))

    expires_at = datetime.now(timezone.utc) + timedelta(seconds=req.duration_seconds)
    delegation = Delegation(
        user_id=user.id,
        mode=req.mode.value,
        token_mint=mint,
        token_account=prepared.token_account,
        delegate_pubkey=prepared.delegate,
        amount_max=req.amount,
        duration_seconds=req.duration_seconds,
        expires_at=expires_at,
        status=DelegationStatus.pending.value,
    )
    db.add(delegation)
    await db.flush()
    await record_audit(
        db, action="delegation.prepare", decision=AuditDecision.accepted,
        user_id=user.id, meta={"mode": req.mode.value, "amount": req.amount, "mint": mint},
    )
    return PreparedDelegationOut(
        delegation_id=delegation.id,
        unsigned_tx=prepared.unsigned_tx_b64,
        token_account=prepared.token_account,
        delegate=prepared.delegate,
        mint=mint,
        amount=req.amount,
        mode=req.mode.value,
        status=delegation.status,
        expires_at=expires_at,
    )


@router.post("/delegations/{delegation_id}/confirm", response_model=DelegationOut)
async def confirm_delegation(
    delegation_id: uuid.UUID,
    req: ConfirmDelegationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DelegationOut:
    delegation = await _load(db, user, delegation_id)
    if delegation.status == DelegationStatus.revoked.value:
        raise HTTPException(status.HTTP_409_CONFLICT, "Délégation révoquée")

    # La durée court à partir de la confirmation on-chain.
    delegation.status = DelegationStatus.active.value
    delegation.approve_tx_sig = req.tx_signature
    delegation.expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=delegation.duration_seconds
    )
    await record_audit(
        db, action="delegation.confirm", decision=AuditDecision.accepted,
        user_id=user.id, meta={"tx_signature": req.tx_signature},
    )
    return DelegationOut.model_validate(delegation)


@router.get("/delegations", response_model=list[DelegationOut])
async def list_delegations(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[DelegationOut]:
    rows = (
        await db.execute(
            select(Delegation)
            .where(Delegation.user_id == user.id)
            .order_by(Delegation.created_at.desc())
        )
    ).scalars().all()
    return [DelegationOut.model_validate(r) for r in rows]


@router.post("/delegations/{delegation_id}/revoke", response_model=RevokeOut)
async def revoke_delegation(
    delegation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RevokeOut:
    """Construit la tx Revoke ET coupe immédiatement l'usage backend (fail-safe)."""
    delegation = await _load(db, user, delegation_id)
    unsigned = await delegation_backend.build_revoke_tx(
        owner=user.wallet_address, token_account=delegation.token_account
    )
    # Fail-safe : on cesse d'utiliser la délégation dès la demande de révocation,
    # sans attendre la confirmation on-chain.
    delegation.status = DelegationStatus.revoked.value
    await record_audit(
        db, action="delegation.revoke", decision=AuditDecision.accepted,
        user_id=user.id, meta={"delegation_id": str(delegation.id)},
    )
    return RevokeOut(
        delegation_id=delegation.id,
        unsigned_tx=unsigned,
        token_account=delegation.token_account,
        status=delegation.status,
    )


async def _load(db: AsyncSession, user: User, delegation_id: uuid.UUID) -> Delegation:
    delegation = await db.get(Delegation, delegation_id)
    if delegation is None or delegation.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Délégation introuvable")
    return delegation
