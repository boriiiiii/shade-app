import threading

import pytest

from sniping.permit import (
    BudgetExceeded,
    PermitError,
    PermitInactive,
    PermitMode,
    new_permit,
)
from sniping.storage import InMemoryStore, StorageError  # noqa: F401

USER = "11111111111111111111111111111111"
SIDE = "22222222222222222222222222222222"


def test_create_side_wallet_unique(store):
    store.create_side_wallet(USER, SIDE, "encrypted-blob")
    with pytest.raises(StorageError):
        store.create_side_wallet(USER, SIDE, "encrypted-blob")


def test_get_side_wallet_returns_record(store):
    store.create_side_wallet(USER, SIDE, "encrypted-blob")
    rec = store.get_side_wallet(USER)
    assert rec is not None
    assert rec["address"] == SIDE
    assert rec["encrypted_key"] == "encrypted-blob"


def test_consume_permit_atomic_increments(store):
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    store.save_permit(p)
    after = store.consume_permit(p.id, 300)
    assert after.budget_lamports_used == 300
    after2 = store.consume_permit(p.id, 200)
    assert after2.budget_lamports_used == 500


def test_consume_overflow_blocks_and_does_not_mutate(store):
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    store.save_permit(p)
    store.consume_permit(p.id, 800)
    with pytest.raises(BudgetExceeded):
        store.consume_permit(p.id, 300)
    # State unchanged after the failed call.
    current = store.get_permit(p.id)
    assert current.budget_lamports_used == 800


def test_revoke_makes_consume_fail(store):
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    store.save_permit(p)
    store.revoke_permit(p.id)
    with pytest.raises(PermitInactive):
        store.consume_permit(p.id, 1)


def test_revoke_unknown_permit_raises(store):
    with pytest.raises(StorageError):
        store.revoke_permit("does-not-exist")


def test_consume_unknown_permit_raises(store):
    with pytest.raises(StorageError):
        store.consume_permit("does-not-exist", 1)


def test_concurrent_consumption_respects_budget(store):
    """20 threads each try to consume 100 lamports against a 1000 budget.
    Exactly 10 should succeed; the rest must be rejected (BudgetExceeded
    while there's still budget left, then PermitInactive once it hits zero).
    Final used budget must equal exactly the budget cap."""
    p = new_permit(USER, SIDE, PermitMode.FULL_TRUST, 1_000)
    store.save_permit(p)

    successes = []
    failures = []
    barrier = threading.Barrier(20)

    def worker():
        barrier.wait()
        try:
            store.consume_permit(p.id, 100)
            successes.append(1)
        except (BudgetExceeded, PermitInactive, PermitError):
            failures.append(1)

    threads = [threading.Thread(target=worker) for _ in range(20)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    final = store.get_permit(p.id)
    assert final.budget_lamports_used == 1_000
    assert len(successes) == 10
    assert len(failures) == 10


def test_list_permits_filters_by_user(store):
    p1 = new_permit("user-a", SIDE, PermitMode.FULL_TRUST, 100)
    p2 = new_permit("user-b", SIDE, PermitMode.FULL_TRUST, 100)
    store.save_permit(p1)
    store.save_permit(p2)
    assert {p.id for p in store.list_permits("user-a")} == {p1.id}
    assert {p.id for p in store.list_permits("user-b")} == {p2.id}


def test_record_and_list_snipes(store):
    store.record_snipe(
        {
            "user_wallet": USER,
            "id": "abc",
            "permit_id": "p1",
            "token_mint": "m",
            "amount_lamports": 1,
            "tx_signature": "sig",
            "status": "dry_run",
            "created_at": "now",
        }
    )
    store.record_snipe(
        {
            "user_wallet": "other",
            "id": "def",
            "permit_id": "p2",
            "token_mint": "m",
            "amount_lamports": 1,
            "tx_signature": "sig",
            "status": "dry_run",
            "created_at": "now",
        }
    )
    mine = store.list_snipes(USER)
    assert len(mine) == 1
    assert mine[0]["id"] == "abc"
