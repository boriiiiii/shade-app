"""Routes du flux Order."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_user
from app.db.models import User
from app.db.session import get_db
from app.orders import service
from app.orders.schemas import (
    OrderListOut,
    OrderOut,
    PrepareOrderRequest,
    SubmitOrderRequest,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/prepare", response_model=OrderOut)
async def prepare(
    req: PrepareOrderRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    """Valide + reconstruit l'ordre côté serveur → 'ready_to_sign'."""
    order = await service.prepare_order(db, user, req)
    return OrderOut.model_validate(order)


@router.post("/{order_id}/submit", response_model=OrderOut)
async def submit(
    order_id: uuid.UUID,
    req: SubmitOrderRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    """Mode Manuel : diffuse la transaction signée par l'utilisateur."""
    order = await service.submit_signed_order(db, user, order_id, req.signed_tx)
    return OrderOut.model_validate(order)


@router.post("/{order_id}/execute", response_model=OrderOut)
async def execute(
    order_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    """Mode Degen / Full Trust : exécution par le side wallet, dans les limites approuvées."""
    order = await service.execute_delegated_order(db, user, order_id)
    return OrderOut.model_validate(order)


@router.get("/{order_id}", response_model=OrderOut)
async def get_one(
    order_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    order = await service.get_order(db, user, order_id, refresh=True)
    return OrderOut.model_validate(order)


@router.get("", response_model=OrderListOut)
async def list_all(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderListOut:
    orders, agg = await service.list_orders(db, user)
    return OrderListOut(orders=[OrderOut.model_validate(o) for o in orders], **agg)
