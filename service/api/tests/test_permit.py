from datetime import timedelta

import pytest

from sniping.permit import (
    BudgetExceeded,
    Permit,
    PermitError,
    PermitInactive,
    PermitMode,
    check_can_consume,
    is_active,
    new_permit,
    now_utc,
)

USER = "11111111111111111111111111111111"
SIDE = "22222222222222222222222222222222"


def test_degen_requires_duration():
    with pytest.raises(PermitError):
        new_permit(USER, SIDE, PermitMode.DEGEN, 1_000, duration_seconds=None)
    with pytest.raises(PermitError):
        new_permit(USER, SIDE, PermitMode.DEGEN, 1_000, duration_seconds=0)


def test_full_trust_rejects_duration():
    with pytest.raises(PermitError):
        new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000, duration_seconds=600)


def test_manual_rejects_duration():
    with pytest.raises(PermitError):
        new_permit(USER, SIDE, PermitMode.MANUAL, 1_000, duration_seconds=600)


def test_budget_must_be_positive():
    with pytest.raises(PermitError):
        new_permit(USER, SIDE, PermitMode.FULL_TRUST, 0, duration_seconds=None)
    with pytest.raises(PermitError):
        new_permit(USER, SIDE, PermitMode.FULL_TRUST, -10, duration_seconds=None)


def test_degen_sets_expiration():
    p = new_permit(USER, SIDE, PermitMode.DEGEN, 5_000, duration_seconds=120)
    assert p.expires_at is not None
    delta = p.expires_at - now_utc()
    assert timedelta(seconds=110) < delta <= timedelta(seconds=121)


def test_full_trust_has_no_expiration():
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 5_000)
    assert p.expires_at is None
    assert is_active(p)


def test_active_then_expired():
    p = new_permit(USER, SIDE, PermitMode.DEGEN, 5_000, duration_seconds=60)
    assert is_active(p)
    future = now_utc() + timedelta(seconds=120)
    assert not is_active(p, now=future)


def test_revoked_is_inactive():
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 5_000)
    revoked = Permit(**{**p.__dict__, "revoked_at": now_utc()})
    assert not is_active(revoked)


def test_check_can_consume_rejects_non_positive():
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    with pytest.raises(PermitError):
        check_can_consume(p, 0)
    with pytest.raises(PermitError):
        check_can_consume(p, -1)


def test_check_can_consume_blocks_expired():
    p = new_permit(USER, SIDE, PermitMode.DEGEN, 1_000, duration_seconds=60)
    future = now_utc() + timedelta(seconds=120)
    with pytest.raises(PermitInactive):
        check_can_consume(p, 100, now=future)


def test_check_can_consume_blocks_overflow():
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    # OK at the boundary.
    check_can_consume(p, 1_000)
    # One lamport over fails.
    with pytest.raises(BudgetExceeded):
        check_can_consume(p, 1_001)


def test_check_can_consume_accumulates():
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    used_500 = Permit(**{**p.__dict__, "budget_lamports_used": 500})
    check_can_consume(used_500, 500)  # exactly fills it
    with pytest.raises(BudgetExceeded):
        check_can_consume(used_500, 501)


def test_exhausted_budget_inactive():
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    exhausted = Permit(**{**p.__dict__, "budget_lamports_used": 1_000})
    assert not is_active(exhausted)
