"""Routes copy trading."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_user
from app.copytrade import service
from app.copytrade.schemas import (
    CopyConfigOut,
    CopyConfigRequest,
    TraderCreate,
    TraderOut,
)
from app.db.models import User
from app.db.session import get_db
from app.orders.schemas import OrderOut

router = APIRouter(prefix="/copytrade", tags=["copytrade"])


@router.get("/traders", response_model=list[TraderOut])
async def traders(db: AsyncSession = Depends(get_db)) -> list[TraderOut]:
    rows = await service.list_traders(db)
    return [TraderOut.model_validate(t) for t in rows]


@router.post("/traders", response_model=TraderOut)
async def add_trader(
    payload: TraderCreate,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TraderOut:
    trader = await service.create_trader(db, payload)
    return TraderOut.model_validate(trader)


@router.post("/configs", response_model=CopyConfigOut)
async def upsert_config(
    req: CopyConfigRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CopyConfigOut:
    cfg = await service.upsert_config(db, user, req)
    return CopyConfigOut.model_validate(cfg)


@router.get("/configs", response_model=list[CopyConfigOut])
async def list_configs(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[CopyConfigOut]:
    rows = await service.list_configs(db, user)
    return [CopyConfigOut.model_validate(c) for c in rows]


@router.post("/configs/{config_id}/execute", response_model=OrderOut)
async def execute(
    config_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    """Simule un trade détecté chez le trader copié et le route dans le pipeline d'ordres."""
    order = await service.execute_copy(db, user, config_id)
    return OrderOut.model_validate(order)
