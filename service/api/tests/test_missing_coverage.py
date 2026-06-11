"""
Documented coverage gaps.

Each skipped test below names a real piece of business logic that does not
exist yet. The skip reason describes what code is missing so the reader can
implement it AND the test in the same change.

DO NOT replace these with passing tests until the underlying feature ships.
A skipped test is honest; a fake green test is not.
"""
import pytest

import main
from sniping import engine
from sniping.permit import PermitMode, new_permit


USER = "11111111111111111111111111111111"
SIDE = "So11111111111111111111111111111111111111112"
TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"


@pytest.mark.skip(
    reason="MISSING CODE: engine.try_snipe(dry_run=False) currently raises "
    "SnipeError('real swap path not implemented yet'). The Degen mode "
    "promises automated execution by the side wallet within budget — that "
    "execution wiring (Jupiter quote + side-wallet signature + broadcast + "
    "refund-on-failure) is not implemented. Until then we cannot test that "
    "the side wallet actually swaps. See engine.py:38."
)
def test_degen_mode_executes_swap_with_side_wallet(store):
    p = new_permit(USER, SIDE, PermitMode.DEGEN, 100_000, duration_seconds=600)
    store.save_permit(p)
    rec = engine.try_snipe(store, p.id, TOKEN, 50_000, dry_run=False)
    assert rec["status"] == "executed"
    assert rec["tx_signature"] and not rec["tx_signature"].startswith("DRYRUN")


@pytest.mark.skip(
    reason="MISSING CODE: Full Trust permits promise 24/7 backend execution. "
    "service/worker-solana/ is an empty directory. No worker process polls "
    "detected pools or fires snipes on the user's behalf. Test the worker "
    "once it exists — until then, FULL_TRUST mode is permit-only (cap budget "
    "+ active state), already covered by test_permit / test_storage."
)
def test_full_trust_worker_executes_within_budget():
    pass


@pytest.mark.skip(
    reason="MISSING CODE: Manual mode is described as "
    "'detection → notification → manual signature'. The backend has no "
    "push-notification endpoint and no detected-trade queue per user. "
    "Today the front polls Solana RPC itself (via /solana/signatures) and "
    "shows trades in-app. There is no backend code path proving that a "
    "detection produces a server-side notification — so we cannot test it."
)
def test_manual_mode_emits_push_notification_on_detection():
    pass


@pytest.mark.skip(
    reason="STRUCTURAL BUG: /swap/transaction does not validate any permit. "
    "Any caller can request an unsigned swap-tx for any wallet, without an "
    "active permit. The signing wall (Phantom) still protects the user — "
    "but the back-end permit module is not consulted. When the wiring lands "
    "(`require_active_permit` dependency in router), assert here that a "
    "swap request without a matching active permit returns 403."
)
def test_swap_transaction_requires_active_permit():
    from fastapi.testclient import TestClient

    client = TestClient(main.app)
    res = client.post(
        "/swap/transaction",
        json={
            "output_mint": TOKEN,
            "amount_lamports": 1_000,
            "user_public_key": USER,
        },
    )
    # Once enforced: should be 403 without a permit. Today returns 502/200
    # depending on Jupiter's mood — i.e. permit is bypassable.
    assert res.status_code == 403


@pytest.mark.skip(
    reason="MISSING TESTABILITY: copytrading.tsx and snipe.tsx are React "
    "components that hold the orchestration logic inline (polling loop, "
    "extractSwap parser, Phantom deep-link handler). They cannot be unit "
    "tested without either (a) installing @testing-library/react-native + "
    "react-test-renderer and rendering the component, or (b) extracting "
    "extractSwap into a pure module in lib/. Either route requires a small "
    "refactor we intentionally did not perform in this test-coverage PR. "
    "See shade-app/app/(tabs)/copytrading.tsx:73 (extractSwap)."
)
def test_copytrading_extract_swap_pure_function():
    pass
