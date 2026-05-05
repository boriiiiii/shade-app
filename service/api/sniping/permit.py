import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional


class PermitMode(str, Enum):
    MANUAL = "manual"
    DEGEN = "degen"
    FULL_TRUST = "full_trust"


class PermitError(Exception):
    pass


class BudgetExceeded(PermitError):
    pass


class PermitInactive(PermitError):
    pass


@dataclass(frozen=True)
class Permit:
    id: str
    user_wallet: str
    side_wallet_address: str
    mode: PermitMode
    budget_lamports_max: int
    budget_lamports_used: int
    expires_at: Optional[datetime]
    revoked_at: Optional[datetime]
    created_at: datetime


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_permit(
    user_wallet: str,
    side_wallet_address: str,
    mode: PermitMode,
    budget_lamports_max: int,
    duration_seconds: Optional[int] = None,
) -> Permit:
    if budget_lamports_max <= 0:
        raise PermitError("budget_lamports_max must be positive")

    if mode == PermitMode.DEGEN:
        if duration_seconds is None or duration_seconds <= 0:
            raise PermitError("DEGEN mode requires a positive duration_seconds")
        expires_at: Optional[datetime] = now_utc() + timedelta(seconds=duration_seconds)
    elif mode == PermitMode.FULL_TRUST:
        if duration_seconds is not None:
            raise PermitError("FULL_TRUST does not accept duration_seconds")
        expires_at = None
    elif mode == PermitMode.MANUAL:
        if duration_seconds is not None:
            raise PermitError("MANUAL does not accept duration_seconds")
        expires_at = None
    else:
        raise PermitError(f"unknown mode: {mode!r}")

    return Permit(
        id=str(uuid.uuid4()),
        user_wallet=user_wallet,
        side_wallet_address=side_wallet_address,
        mode=mode,
        budget_lamports_max=budget_lamports_max,
        budget_lamports_used=0,
        expires_at=expires_at,
        revoked_at=None,
        created_at=now_utc(),
    )


def is_active(p: Permit, now: Optional[datetime] = None) -> bool:
    n = now or now_utc()
    if p.revoked_at is not None:
        return False
    if p.expires_at is not None and n >= p.expires_at:
        return False
    if p.budget_lamports_used >= p.budget_lamports_max:
        return False
    return True


def check_can_consume(
    p: Permit, amount_lamports: int, now: Optional[datetime] = None
) -> None:
    """Raises PermitInactive / BudgetExceeded / PermitError if consumption is not allowed."""
    if amount_lamports <= 0:
        raise PermitError("amount_lamports must be positive")
    if not is_active(p, now):
        raise PermitInactive(f"permit {p.id} is not active")
    if p.budget_lamports_used + amount_lamports > p.budget_lamports_max:
        raise BudgetExceeded(
            f"permit {p.id} would exceed budget: "
            f"used={p.budget_lamports_used} + requested={amount_lamports} "
            f"> max={p.budget_lamports_max}"
        )
