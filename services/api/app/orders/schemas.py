"""Schémas Pydantic du flux Order."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.constants import ExecutionMode, OrderSide, OrderSource


class PrepareOrderRequest(BaseModel):
    mode: ExecutionMode
    side: OrderSide = OrderSide.buy
    input_mint: str
    output_mint: str
    input_amount: int = Field(..., gt=0, description="Montant d'entrée en base units (lamports…)")
    slippage_bps: int = Field(100, ge=0, le=10_000)
    quoted_output_amount: int | None = Field(
        None, gt=0, description="Quote fourni par le client (sinon estimé serveur)"
    )
    source: OrderSource = OrderSource.manual
    source_ref: str | None = None
    delegation_id: uuid.UUID | None = Field(
        None, description="Obligatoire en mode degen / full_trust"
    )
    whitelist: list[str] | None = Field(
        None, description="Whitelist effective (sinon whitelist par défaut)"
    )


class SubmitOrderRequest(BaseModel):
    signed_tx: str = Field(..., description="Transaction signée par le wallet (base64)")


class OrderOut(BaseModel):
    id: uuid.UUID
    mode: str
    status: str
    side: str
    source: str
    source_ref: str | None
    input_mint: str
    output_mint: str
    input_amount: int
    min_output_amount: int | None
    quoted_output_amount: int | None
    slippage_bps: int
    route: dict | None
    delegation_id: uuid.UUID | None
    unsigned_tx: str | None
    tx_signature: str | None
    failure_reason: str | None
    realized_pnl: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListOut(BaseModel):
    orders: list[OrderOut]
    aggregate_pnl: int
    success_count: int
    failed_count: int
