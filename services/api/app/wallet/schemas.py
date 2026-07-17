"""Schémas Pydantic du module wallet / délégation."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.constants import ExecutionMode


class PrepareDelegationRequest(BaseModel):
    mode: ExecutionMode = Field(..., description="degen | full_trust (manual n'a pas de délégation)")
    mint: str | None = Field(None, description="Mint à déléguer (défaut : wSOL)")
    amount: int = Field(..., gt=0, description="Budget max en base units (plafond dur on-chain)")
    duration_seconds: int = Field(..., gt=0, description="Durée de la session de délégation")
    wrap_sol: bool = Field(False, description="Si mint=wSOL, wrap `amount` lamports SOL→wSOL")


class PreparedDelegationOut(BaseModel):
    delegation_id: uuid.UUID
    unsigned_tx: str            # base64, à signer dans le wallet
    token_account: str          # ATA de l'utilisateur (approuvé)
    delegate: str               # side wallet
    mint: str
    amount: int
    mode: str
    status: str
    expires_at: datetime


class ConfirmDelegationRequest(BaseModel):
    tx_signature: str


class DelegationOut(BaseModel):
    id: uuid.UUID
    mode: str
    token_mint: str
    token_account: str
    delegate_pubkey: str
    amount_max: int
    amount_spent: int
    duration_seconds: int
    expires_at: datetime
    status: str
    approve_tx_sig: str | None
    revoke_tx_sig: str | None

    model_config = {"from_attributes": True}


class RevokeOut(BaseModel):
    delegation_id: uuid.UUID
    unsigned_tx: str            # tx `Revoke` à signer dans le wallet
    token_account: str
    status: str


class SideWalletOut(BaseModel):
    pubkey: str
    balance_lamports: int
    network: str
