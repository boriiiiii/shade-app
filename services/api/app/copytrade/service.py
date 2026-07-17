"""Logique copy trading : traders, configs, exécution d'un trade copié (réutilise orders)."""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    DEVNET_USDC_MINT,
    NATIVE_SOL_SENTINEL,
    WSOL_MINT,
    ExecutionMode,
    OrderSide,
    OrderSource,
)
from app.copytrade.schemas import CopyConfigRequest, TraderCreate
from app.db.models import CopyConfig, Delegation, Order, TraderProfile, User
from app.orders import service as order_service
from app.orders.schemas import PrepareOrderRequest


def pick_output_mint(whitelist: list[str] | None, input_mint: str) -> str:
    """Choisit un mint de sortie ≠ entrée (cosmétique en devnet ; sert la validation whitelist)."""
    for mint in whitelist or []:
        if mint != input_mint:
            return mint
    return DEVNET_USDC_MINT if input_mint != DEVNET_USDC_MINT else WSOL_MINT


async def list_traders(db: AsyncSession) -> list[TraderProfile]:
    return list((await db.execute(select(TraderProfile))).scalars().all())


async def create_trader(db: AsyncSession, payload: TraderCreate) -> TraderProfile:
    existing = (
        await db.execute(
            select(TraderProfile).where(TraderProfile.wallet_address == payload.wallet_address)
        )
    ).scalar_one_or_none()
    if existing:
        existing.label = payload.label
        existing.stats = payload.stats
        return existing
    trader = TraderProfile(
        wallet_address=payload.wallet_address, label=payload.label, stats=payload.stats
    )
    db.add(trader)
    await db.flush()
    return trader


async def upsert_config(db: AsyncSession, user: User, req: CopyConfigRequest) -> CopyConfig:
    trader = await db.get(TraderProfile, req.trader_id)
    if trader is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trader introuvable")
    if req.delegation_id is not None:
        deleg = await db.get(Delegation, req.delegation_id)
        if deleg is None or deleg.user_id != user.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Délégation introuvable")

    cfg = (
        await db.execute(
            select(CopyConfig).where(
                CopyConfig.user_id == user.id, CopyConfig.trader_id == req.trader_id
            )
        )
    ).scalar_one_or_none()
    if cfg is None:
        cfg = CopyConfig(user_id=user.id, trader_id=req.trader_id)
        db.add(cfg)
    cfg.position_size = req.position_size
    cfg.max_budget = req.max_budget
    cfg.slippage_bps = req.slippage_bps
    cfg.token_whitelist = req.token_whitelist
    cfg.frequency_seconds = req.frequency_seconds
    cfg.delegation_id = req.delegation_id
    cfg.enabled = req.enabled
    await db.flush()
    return cfg


async def list_configs(db: AsyncSession, user: User) -> list[CopyConfig]:
    return list(
        (await db.execute(select(CopyConfig).where(CopyConfig.user_id == user.id))).scalars().all()
    )


async def execute_copy(db: AsyncSession, user: User, config_id: uuid.UUID) -> Order:
    """Simule un trade détecté chez le trader copié → construit (et exécute si délégué) l'ordre."""
    cfg = await db.get(CopyConfig, config_id)
    if cfg is None or cfg.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Config de copie introuvable")
    if not cfg.enabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Config de copie désactivée")

    if cfg.delegation_id is not None:
        deleg = await db.get(Delegation, cfg.delegation_id)
        if deleg is None or deleg.user_id != user.id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Délégation introuvable")
        input_mint = deleg.token_mint
        req = PrepareOrderRequest(
            mode=ExecutionMode(deleg.mode),
            side=OrderSide.buy,
            input_mint=input_mint,
            output_mint=pick_output_mint(cfg.token_whitelist, input_mint),
            input_amount=cfg.position_size,
            slippage_bps=cfg.slippage_bps,
            source=OrderSource.copytrade,
            source_ref=str(cfg.trader_id),
            delegation_id=cfg.delegation_id,
            whitelist=cfg.token_whitelist or None,
        )
        order = await order_service.prepare_order(db, user, req)
        return await order_service.execute_delegated_order(db, user, order.id)

    # Sans délégation → Mode Manuel : l'utilisateur signera l'ordre 'ready_to_sign'.
    req = PrepareOrderRequest(
        mode=ExecutionMode.manual,
        side=OrderSide.buy,
        input_mint=NATIVE_SOL_SENTINEL,
        output_mint=WSOL_MINT,
        input_amount=cfg.position_size,
        slippage_bps=cfg.slippage_bps,
        source=OrderSource.copytrade,
        source_ref=str(cfg.trader_id),
    )
    return await order_service.prepare_order(db, user, req)


async def seed_default_traders(db: AsyncSession) -> None:
    """Amorce quelques traders de démonstration (dev)."""
    count = (await db.execute(select(TraderProfile))).scalars().first()
    if count is not None:
        return
    demo = [
        ("Grape9xQ7t9c9m3F2mVQ8kZ1cJ8y5H1uJvN4pR6sT7bA", "Whale — low vol", {"win_rate": 0.71, "trades_30d": 42}),
        ("Copy8xB3nD5vK2wLmP9qR4tYuI6oA1sE7dF3gH8jK0lZ", "Momentum sniper", {"win_rate": 0.58, "trades_30d": 210}),
        ("Steady7yC4mE6vN3xLpQ8rS5tUvW2oB9aF1dG4hJ7kM1", "Steady DCA", {"win_rate": 0.64, "trades_30d": 30}),
    ]
    for addr, label, stats in demo:
        db.add(TraderProfile(wallet_address=addr, label=label, stats=stats))
    await db.flush()
