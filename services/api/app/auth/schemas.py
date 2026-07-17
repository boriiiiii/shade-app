"""Schémas Pydantic du flux Auth."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class NonceRequest(BaseModel):
    wallet_address: str = Field(..., min_length=32, max_length=64)


class NonceResponse(BaseModel):
    wallet_address: str
    nonce: str
    message: str  # message exact à signer
    expires_at: datetime


class VerifyRequest(BaseModel):
    wallet_address: str = Field(..., min_length=32, max_length=64)
    nonce: str
    signature: str  # base58 (Phantom) ou base64, 64 octets


class UserOut(BaseModel):
    id: uuid.UUID
    wallet_address: str
    chain: str
    subscription_tier: str
    preferences: dict

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: UserOut
