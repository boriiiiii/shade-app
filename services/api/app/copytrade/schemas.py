"""Schémas Pydantic du copy trading."""
from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class TraderOut(BaseModel):
    id: uuid.UUID
    wallet_address: str
    label: str
    stats: dict

    model_config = {"from_attributes": True}


class TraderCreate(BaseModel):
    wallet_address: str = Field(..., min_length=32, max_length=64)
    label: str
    stats: dict = Field(default_factory=dict)


class CopyConfigRequest(BaseModel):
    trader_id: uuid.UUID
    position_size: int = Field(..., gt=0, description="Taille de position par trade (base units)")
    max_budget: int = Field(..., gt=0)
    slippage_bps: int = Field(100, ge=0, le=10_000)
    token_whitelist: list[str] = Field(default_factory=list)
    frequency_seconds: int = Field(0, ge=0)
    delegation_id: uuid.UUID | None = None
    enabled: bool = True


class CopyConfigOut(BaseModel):
    id: uuid.UUID
    trader_id: uuid.UUID
    position_size: int
    max_budget: int
    slippage_bps: int
    token_whitelist: list
    frequency_seconds: int
    delegation_id: uuid.UUID | None
    enabled: bool

    model_config = {"from_attributes": True}
