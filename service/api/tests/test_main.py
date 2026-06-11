"""
Tests for main.py — the public-facing routes the mobile app calls.

Coverage focus (sniping + manual copy critical path):

  * POST /swap/transaction  → Jupiter proxy (sniping core, manual copy core).
  * GET  /solana/signatures/{address}  → manual copy detection feed.
  * GET  /solana/transaction/{signature} → manual copy enrichment feed.
  * GET  /                  → liveness.

Supabase-backed routes (/auth/wallet, /health) are pinned with a single
mocked-client happy-path test each. Deeper Supabase semantics are out of scope
for these unit tests — they belong to integration tests against a real
Supabase project.

All external IO (Jupiter HTTP, Solana RPC, Supabase) is mocked. No socket is
ever opened.
"""
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture
def client():
    return TestClient(main.app)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_response(status_code: int, json_data=None, text: str = ""):
    """Mimic enough of `requests.Response` for main.py."""
    m = MagicMock()
    m.status_code = status_code
    m.json.return_value = json_data or {}
    m.text = text or (str(json_data) if json_data else "")
    return m


# ---------------------------------------------------------------------------
# / (liveness)
# ---------------------------------------------------------------------------

def test_root_returns_hello_and_supabase_flag(client, monkeypatch):
    monkeypatch.setattr(main, "SUPABASE_URL", "https://example.supabase.co")
    res = client.get("/")
    assert res.status_code == 200
    body = res.json()
    assert body["hello"] == "world"
    assert body["supabase_configured"] is True


def test_root_reports_supabase_not_configured(client, monkeypatch):
    monkeypatch.setattr(main, "SUPABASE_URL", None)
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["supabase_configured"] is False


# ---------------------------------------------------------------------------
# POST /swap/transaction — sniping + manual copy critical path
# ---------------------------------------------------------------------------

VALID_SWAP_BODY = {
    "output_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount_lamports": 100_000_000,
    "user_public_key": "11111111111111111111111111111111",
    "slippage_bps": 200,
}


def test_swap_happy_path_returns_unsigned_tx_and_quote(client):
    quote = {"outAmount": "42", "priceImpactPct": "0.01"}
    swap_payload = {"swapTransaction": "BASE64_TX"}

    with patch.object(main.req, "get", return_value=_mock_response(200, quote)) as get_mock, \
         patch.object(main.req, "post", return_value=_mock_response(200, swap_payload)) as post_mock:
        res = client.post("/swap/transaction", json=VALID_SWAP_BODY)

    assert res.status_code == 200, res.text
    body = res.json()
    assert body["swap_transaction"] == "BASE64_TX"
    assert body["quote"] == quote

    # Quote params correctly forwarded.
    quote_params = get_mock.call_args.kwargs["params"]
    assert quote_params["inputMint"] == main.SOL_MINT
    assert quote_params["outputMint"] == VALID_SWAP_BODY["output_mint"]
    assert quote_params["amount"] == VALID_SWAP_BODY["amount_lamports"]
    assert quote_params["slippageBps"] == VALID_SWAP_BODY["slippage_bps"]

    # Swap body uses the just-fetched quote and the user's pubkey.
    swap_body = post_mock.call_args.kwargs["json"]
    assert swap_body["quoteResponse"] == quote
    assert swap_body["userPublicKey"] == VALID_SWAP_BODY["user_public_key"]
    assert swap_body["wrapAndUnwrapSol"] is True


def test_swap_uses_default_slippage_when_omitted(client):
    body = {k: v for k, v in VALID_SWAP_BODY.items() if k != "slippage_bps"}
    with patch.object(main.req, "get", return_value=_mock_response(200, {})) as get_mock, \
         patch.object(main.req, "post", return_value=_mock_response(200, {"swapTransaction": "X"})):
        res = client.post("/swap/transaction", json=body)
    assert res.status_code == 200
    assert get_mock.call_args.kwargs["params"]["slippageBps"] == 300


def test_swap_quote_non_200_returns_502(client):
    with patch.object(main.req, "get", return_value=_mock_response(400, text="bad mint")):
        res = client.post("/swap/transaction", json=VALID_SWAP_BODY)
    assert res.status_code == 502
    assert "Jupiter quote failed" in res.json()["detail"]


def test_swap_transaction_non_200_returns_502(client):
    with patch.object(main.req, "get", return_value=_mock_response(200, {"foo": "bar"})), \
         patch.object(main.req, "post", return_value=_mock_response(500, text="overload")):
        res = client.post("/swap/transaction", json=VALID_SWAP_BODY)
    assert res.status_code == 502
    assert "Jupiter swap failed" in res.json()["detail"]


def test_swap_accepts_v1_transaction_field_as_fallback(client):
    """V6 returns `swapTransaction`, V1 returns `transaction`. Both must work."""
    with patch.object(main.req, "get", return_value=_mock_response(200, {})), \
         patch.object(main.req, "post", return_value=_mock_response(200, {"transaction": "V1_TX"})):
        res = client.post("/swap/transaction", json=VALID_SWAP_BODY)
    assert res.status_code == 200
    assert res.json()["swap_transaction"] == "V1_TX"


def test_swap_missing_transaction_field_returns_502(client):
    """If Jupiter responds OK but with neither key, callers must NOT proceed."""
    with patch.object(main.req, "get", return_value=_mock_response(200, {})), \
         patch.object(main.req, "post", return_value=_mock_response(200, {})):
        res = client.post("/swap/transaction", json=VALID_SWAP_BODY)
    assert res.status_code == 502
    assert "No transaction" in res.json()["detail"]


def test_swap_network_error_returns_500(client):
    with patch.object(main.req, "get", side_effect=ConnectionError("dns")):
        res = client.post("/swap/transaction", json=VALID_SWAP_BODY)
    assert res.status_code == 500


def test_swap_response_is_unsigned_blob_no_private_key_anywhere(client):
    """
    Sniping/Manual copy invariant:
        the backend MUST return only an unsigned tx + the public quote payload.
        It MUST NOT include any private material or pre-signed bytes — signing
        happens client-side via Phantom. This test pins the response shape.
    """
    swap_payload = {"swapTransaction": "BASE64_UNSIGNED"}
    with patch.object(main.req, "get", return_value=_mock_response(200, {"outAmount": "1"})), \
         patch.object(main.req, "post", return_value=_mock_response(200, swap_payload)):
        res = client.post("/swap/transaction", json=VALID_SWAP_BODY)

    body = res.json()
    assert set(body.keys()) == {"swap_transaction", "quote"}
    assert isinstance(body["swap_transaction"], str)
    # Sanity: no secret-key-shaped fields leaked.
    for forbidden in ("secret", "private_key", "signed", "signature"):
        assert forbidden not in body


# ---------------------------------------------------------------------------
# Solana RPC proxy — manual copy detection feed
# ---------------------------------------------------------------------------

async def _fake_rpc(method: str, params: list):
    """Default fake that returns a method-specific stub."""
    if method == "getSignaturesForAddress":
        return [
            {"signature": "sig1", "blockTime": 1, "err": None},
            {"signature": "sig2", "blockTime": 2, "err": None},
        ]
    if method == "getTransaction":
        return {"meta": {"err": None}, "transaction": {}}
    return None


def test_solana_signatures_proxy_unwraps_rpc_result(client):
    async def fake(method, params):
        assert method == "getSignaturesForAddress"
        assert params[0] == "TargetAddr"
        assert params[1]["limit"] == 7
        return [{"signature": "ok", "blockTime": 1, "err": None}]

    with patch.object(main, "solana_rpc", side_effect=fake):
        res = client.get("/solana/signatures/TargetAddr", params={"limit": 7})

    assert res.status_code == 200
    assert res.json() == {"signatures": [{"signature": "ok", "blockTime": 1, "err": None}]}


def test_solana_signatures_uses_default_limit_when_omitted(client):
    async def fake(method, params):
        assert params[1]["limit"] == 20
        return []

    with patch.object(main, "solana_rpc", side_effect=fake):
        res = client.get("/solana/signatures/TargetAddr")
    assert res.status_code == 200


def test_solana_transaction_proxy_unwraps_rpc_result(client):
    async def fake(method, params):
        assert method == "getTransaction"
        assert params[0] == "SIG42"
        return {"meta": {"err": None}, "transaction": {"message": {}}}

    with patch.object(main, "solana_rpc", side_effect=fake):
        res = client.get("/solana/transaction/SIG42")

    assert res.status_code == 200
    assert res.json()["transaction"]["meta"]["err"] is None


def test_solana_rpc_failure_propagates_as_502(client):
    from fastapi import HTTPException

    async def fake(method, params):
        raise HTTPException(status_code=502, detail="All Solana RPCs failed")

    with patch.object(main, "solana_rpc", side_effect=fake):
        res = client.get("/solana/signatures/Addr")

    assert res.status_code == 502
    assert "RPCs failed" in res.json()["detail"]


# ---------------------------------------------------------------------------
# Supabase-backed routes — smoke tests with mocked client.
# ---------------------------------------------------------------------------

def _supabase_client_returning(data):
    """Build a chained-call mock that mirrors how main.py talks to supabase."""
    chain = MagicMock()
    chain.table.return_value.select.return_value.eq.return_value.execute.return_value.data = data
    chain.table.return_value.insert.return_value.execute.return_value.data = data
    chain.table.return_value.select.return_value.limit.return_value.execute.return_value.data = data
    return chain


def test_auth_wallet_returns_existing_profile(client):
    existing = [{"id": "u1", "wallet_address": "Addr", "wallet_type": "phantom", "created_at": "now"}]
    with patch.object(main, "get_supabase", return_value=_supabase_client_returning(existing)):
        res = client.post("/auth/wallet", json={"wallet_address": "Addr", "wallet_type": "phantom"})
    assert res.status_code == 200
    body = res.json()
    assert body["is_new"] is False
    assert body["user"]["wallet_address"] == "Addr"


def test_auth_wallet_creates_new_profile_when_missing(client):
    """First select returns empty, insert returns the created row."""
    created = [{"id": "u2", "wallet_address": "Other", "wallet_type": "evm", "created_at": "now"}]
    chain = MagicMock()
    chain.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    chain.table.return_value.insert.return_value.execute.return_value.data = created

    with patch.object(main, "get_supabase", return_value=chain):
        res = client.post("/auth/wallet", json={"wallet_address": "Other", "wallet_type": "evm"})

    assert res.status_code == 200
    body = res.json()
    assert body["is_new"] is True
    assert body["user"]["wallet_type"] == "evm"


def test_health_pings_supabase(client):
    with patch.object(main, "get_supabase", return_value=_supabase_client_returning([{"wallet_address": "x"}])):
        res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
