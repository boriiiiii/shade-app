"""Respect des limites budget / durée en Mode Degen (revérifiées à chaque exécution)."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import pytest

from app.core.constants import WSOL_MINT, DelegationStatus, ExecutionMode
from app.orders.validation import OrderValidationError, check_delegation_limits


@dataclass
class FakeDelegation:
    status: str
    mode: str
    expires_at: datetime
    amount_max: int
    amount_spent: int
    token_mint: str = WSOL_MINT


def _delegation(**overrides) -> FakeDelegation:
    base = dict(
        status=DelegationStatus.active.value,
        mode=ExecutionMode.degen.value,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        amount_max=5_000_000_000,  # 5 SOL
        amount_spent=0,
    )
    base.update(overrides)
    return FakeDelegation(**base)


def test_within_budget_and_time_ok() -> None:
    check_delegation_limits(
        _delegation(), amount=1_000_000_000, mode=ExecutionMode.degen
    )  # ne lève pas


def test_budget_exceeded_rejected() -> None:
    deleg = _delegation(amount_spent=4_500_000_000)  # 4.5 déjà dépensés
    with pytest.raises(OrderValidationError) as exc:
        check_delegation_limits(deleg, amount=1_000_000_000, mode=ExecutionMode.degen)
    assert exc.value.code == "budget_exceeded"


def test_budget_boundary_exact_is_allowed() -> None:
    deleg = _delegation(amount_spent=4_000_000_000)
    check_delegation_limits(deleg, amount=1_000_000_000, mode=ExecutionMode.degen)  # pile au max


def test_budget_boundary_one_over_rejected() -> None:
    deleg = _delegation(amount_spent=4_000_000_001)
    with pytest.raises(OrderValidationError) as exc:
        check_delegation_limits(deleg, amount=1_000_000_000, mode=ExecutionMode.degen)
    assert exc.value.code == "budget_exceeded"


def test_expired_duration_rejected() -> None:
    deleg = _delegation(expires_at=datetime.now(timezone.utc) - timedelta(minutes=1))
    with pytest.raises(OrderValidationError) as exc:
        check_delegation_limits(deleg, amount=1, mode=ExecutionMode.degen)
    assert exc.value.code == "delegation_expired"


def test_revoked_delegation_rejected() -> None:
    deleg = _delegation(status=DelegationStatus.revoked.value)
    with pytest.raises(OrderValidationError) as exc:
        check_delegation_limits(deleg, amount=1, mode=ExecutionMode.degen)
    assert exc.value.code == "delegation_inactive"


def test_mode_mismatch_rejected() -> None:
    deleg = _delegation(mode=ExecutionMode.full_trust.value)
    with pytest.raises(OrderValidationError) as exc:
        check_delegation_limits(deleg, amount=1, mode=ExecutionMode.degen)
    assert exc.value.code == "delegation_mode_mismatch"


def test_naive_expiry_is_treated_as_utc() -> None:
    # Une expiration naïve (SQLite) ne doit pas faire planter la comparaison.
    deleg = _delegation(expires_at=datetime.now() + timedelta(hours=1))
    check_delegation_limits(deleg, amount=1, mode=ExecutionMode.degen)
