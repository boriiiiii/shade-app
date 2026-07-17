"""Routes sniping."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_user
from app.db.models import User
from app.db.session import get_db
from app.orders.schemas import OrderOut
from app.sniping import service
from app.sniping.schemas import SnipeConfigOut, SnipeConfigRequest, SnipeEventRequest

router = APIRouter(prefix="/sniping", tags=["sniping"])


@router.post("/configs", response_model=SnipeConfigOut)
async def upsert_config(
    req: SnipeConfigRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SnipeConfigOut:
    cfg = await service.upsert_config(db, user, req)
    return SnipeConfigOut.model_validate(cfg)


@router.get("/config", response_model=SnipeConfigOut)
async def get_config(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> SnipeConfigOut:
    cfg = await service.get_config(db, user)
    if cfg is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Aucune config de sniping")
    return SnipeConfigOut.model_validate(cfg)


@router.post("/events", response_model=OrderOut)
async def simulate_event(
    event: SnipeEventRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderOut:
    """Simule un événement 'nouveau token' (devnet) → déclenche le snipe dans les limites."""
    order = await service.trigger_event(db, user, event)
    return OrderOut.model_validate(order)
