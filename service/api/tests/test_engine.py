import pytest

from sniping import engine
from sniping.permit import BudgetExceeded, PermitMode, new_permit

# Real Solana addresses (System Program + Wrapped SOL mint) are valid base58 pubkeys.
USER = "11111111111111111111111111111111"
SIDE = "So11111111111111111111111111111111111111112"
TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"


def test_dry_run_consumes_budget_and_records(store):
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 10_000)
    store.save_permit(p)

    rec = engine.try_snipe(store, p.id, TOKEN, 2_500, dry_run=True)

    assert rec["status"] == "dry_run"
    assert rec["tx_signature"].startswith("DRYRUN-")
    assert rec["amount_lamports"] == 2_500
    assert rec["permit_id"] == p.id

    after = store.get_permit(p.id)
    assert after.budget_lamports_used == 2_500
    assert store.list_snipes(USER) == [rec]


def test_dry_run_blocks_invalid_token_mint(store):
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 10_000)
    store.save_permit(p)
    with pytest.raises(engine.SnipeError):
        engine.try_snipe(store, p.id, "not-a-pubkey", 100, dry_run=True)
    # Budget untouched.
    assert store.get_permit(p.id).budget_lamports_used == 0


def test_real_swap_path_disabled_does_not_burn_budget(store):
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 10_000)
    store.save_permit(p)
    with pytest.raises(engine.SnipeError):
        engine.try_snipe(store, p.id, TOKEN, 100, dry_run=False)
    # Refusing the unimplemented path MUST NOT consume the user's budget.
    assert store.get_permit(p.id).budget_lamports_used == 0
    assert store.list_snipes(USER) == []


def test_dry_run_blocks_when_budget_exceeded(store):
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    store.save_permit(p)
    engine.try_snipe(store, p.id, TOKEN, 800, dry_run=True)
    with pytest.raises(BudgetExceeded):
        engine.try_snipe(store, p.id, TOKEN, 300, dry_run=True)
    # Only the first snipe was recorded.
    assert len(store.list_snipes(USER)) == 1
