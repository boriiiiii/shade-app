from typing import Optional

from pydantic import BaseModel, Field

from .permit import PermitMode


class CreateSideWalletRequest(BaseModel):
    user_wallet: str


class SideWalletResponse(BaseModel):
    user_wallet: str
    deposit_address: str
    balance_lamports: Optional[int] = None


class CreatePermitRequest(BaseModel):
    user_wallet: str
    mode: PermitMode
    budget_lamports_max: int = Field(gt=0)
    duration_seconds: Optional[int] = Field(default=None, gt=0)


class PermitResponse(BaseModel):
    id: str
    user_wallet: str
    side_wallet_address: str
    mode: PermitMode
    budget_lamports_max: int
    budget_lamports_used: int
    expires_at: Optional[str]
    revoked_at: Optional[str]
    created_at: str
    is_active: bool


class DryRunSnipeRequest(BaseModel):
    permit_id: str
    token_mint: str
    amount_lamports: int = Field(gt=0)


class SnipeResponse(BaseModel):
    id: str
    permit_id: str
    user_wallet: str
    token_mint: str
    amount_lamports: int
    tx_signature: str
    status: str
    created_at: str
