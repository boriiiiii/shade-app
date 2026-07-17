"""Logique sniping : config du bot + déclenchement sur événement (Mode Full Trust obligatoire)."""
from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.audit import record_audit
from app.core.constants import (
    AuditDecision,
    ExecutionMode,
    OrderSide,
    OrderSource,
)
from app.db.models import Delegation, Order, SnipeConfig, User
from app.orders import service as order_service
from app.orders.schemas import PrepareOrderRequest
from app.sniping.schemas import SnipeConfigRequest, SnipeEventRequest


async def upsert_config(db: AsyncSession, user: User, req: SnipeConfigRequest) -> SnipeConfig:
    if req.delegation_id is not None:
        deleg = await db.get(Delegation, req.delegation_id)
        if deleg is None or deleg.user_id != user.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Délégation introuvable")
        if req.enabled and deleg.mode != ExecutionMode.full_trust.value:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Le sniping requiert une délégation en mode full_trust",
            )

    cfg = (
        await db.execute(select(SnipeConfig).where(SnipeConfig.user_id == user.id))
    ).scalar_one_or_none()
    if cfg is None:
        cfg = SnipeConfig(user_id=user.id)
        db.add(cfg)
    cfg.max_position = req.max_position
    cfg.slippage_bps = req.slippage_bps
    cfg.max_latency_ms = req.max_latency_ms
    cfg.risk_limits = req.risk_limits
    cfg.token_whitelist = req.token_whitelist
    cfg.delegation_id = req.delegation_id
    cfg.enabled = req.enabled
    await db.flush()
    return cfg


async def get_config(db: AsyncSession, user: User) -> SnipeConfig | None:
    return (
        await db.execute(select(SnipeConfig).where(SnipeConfig.user_id == user.id))
    ).scalar_one_or_none()


async def trigger_event(db: AsyncSession, user: User, event: SnipeEventRequest) -> Order:
    """Déclenche l'exécution du bot snipe de l'utilisateur sur un nouveau token détecté."""
    cfg = await get_config(db, user)
    if cfg is None or not cfg.enabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Aucun bot de sniping actif")
    if cfg.delegation_id is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Sniping non armé : délégation full_trust requise"
        )
    deleg = await db.get(Delegation, cfg.delegation_id)
    if deleg is None or deleg.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Délégation introuvable")
    if deleg.mode != ExecutionMode.full_trust.value:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "La délégation n'est pas en full_trust")

    # Contrainte de latence (garde-fou risque).
    if event.detected_latency_ms is not None and event.detected_latency_ms > cfg.max_latency_ms:
        await record_audit(
            db, action="snipe.trigger", decision=AuditDecision.rejected, user_id=user.id,
            reason=f"latence {event.detected_latency_ms}ms > max {cfg.max_latency_ms}ms",
            meta={"mint": event.mint},
        )
        await db.commit()  # durabilité de l'audit avant de lever l'erreur
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            {"code": "latency_exceeded", "reason": "événement trop ancien pour le snipe"},
        )

    input_mint = deleg.token_mint
    # Whitelist effective : le token ciblé est explicitement autorisé pour ce snipe.
    effective_whitelist = list({input_mint, event.mint, *(cfg.token_whitelist or [])})

    req = PrepareOrderRequest(
        mode=ExecutionMode.full_trust,
        side=OrderSide.buy,
        input_mint=input_mint,
        output_mint=event.mint,
        input_amount=cfg.max_position,
        slippage_bps=cfg.slippage_bps,
        source=OrderSource.snipe,
        source_ref=event.mint,
        delegation_id=cfg.delegation_id,
        whitelist=effective_whitelist,
    )
    order = await order_service.prepare_order(db, user, req)
    return await order_service.execute_delegated_order(db, user, order.id)
