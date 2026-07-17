"""Schémas Pydantic du sniping."""
from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class SnipeConfigRequest(BaseModel):
    max_position: int = Field(..., gt=0, description="Taille max par snipe (base units)")
    slippage_bps: int = Field(200, ge=0, le=10_000)
    max_latency_ms: int = Field(5000, gt=0)
    risk_limits: dict = Field(default_factory=dict)
    token_whitelist: list[str] = Field(default_factory=list, description="Routes/DEX autorisés")
    delegation_id: uuid.UUID | None = Field(
        None, description="Délégation full_trust (obligatoire pour armer le bot)"
    )
    enabled: bool = False


class SnipeConfigOut(BaseModel):
    id: uuid.UUID
    max_position: int
    slippage_bps: int
    max_latency_ms: int
    risk_limits: dict
    token_whitelist: list
    delegation_id: uuid.UUID | None
    enabled: bool

    model_config = {"from_attributes": True}


class SnipeEventRequest(BaseModel):
    """Événement 'nouveau token détecté' (simulé en devnet)."""

    mint: str = Field(..., min_length=32, max_length=64)
    pool: str | None = None
    detected_latency_ms: int | None = Field(None, ge=0)
