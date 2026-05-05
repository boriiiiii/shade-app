"""End-to-end via FastAPI TestClient. Each test gets a fresh in-memory store."""
from sniping.permit import PermitMode

USER = "11111111111111111111111111111111"
TOKEN = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"


def _create_wallet(client, user=USER):
    r = client.post("/sniping/wallet", json={"user_wallet": user})
    assert r.status_code == 200, r.text
    return r.json()


def _create_permit(client, *, mode, budget=1_000_000, duration=None, user=USER):
    body = {
        "user_wallet": user,
        "mode": mode.value,
        "budget_lamports_max": budget,
    }
    if duration is not None:
        body["duration_seconds"] = duration
    r = client.post("/sniping/permit", json=body)
    return r


def test_create_side_wallet_returns_address(client):
    data = _create_wallet(client)
    assert data["user_wallet"] == USER
    assert isinstance(data["deposit_address"], str)
    assert len(data["deposit_address"]) >= 32


def test_create_side_wallet_rejects_invalid_user_address(client):
    r = client.post("/sniping/wallet", json={"user_wallet": "not-base58"})
    assert r.status_code == 400


def test_create_side_wallet_conflict_on_duplicate(client):
    _create_wallet(client)
    r = client.post("/sniping/wallet", json={"user_wallet": USER})
    assert r.status_code == 409


def test_create_permit_requires_side_wallet_first(client):
    r = _create_permit(client, mode=PermitMode.FULL_TRUST)
    assert r.status_code == 400
    assert "side wallet" in r.json()["detail"].lower()


def test_full_trust_permit_flow(client):
    _create_wallet(client)
    r = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=10_000)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["mode"] == "full_trust"
    assert data["budget_lamports_max"] == 10_000
    assert data["budget_lamports_used"] == 0
    assert data["expires_at"] is None
    assert data["is_active"] is True


def test_degen_permit_flow(client):
    _create_wallet(client)
    r = _create_permit(client, mode=PermitMode.DEGEN, budget=5_000, duration=3600)
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "degen"
    assert data["expires_at"] is not None


def test_full_trust_with_duration_is_400(client):
    _create_wallet(client)
    r = _create_permit(client, mode=PermitMode.FULL_TRUST, duration=600)
    assert r.status_code == 400


def test_degen_without_duration_is_422(client):
    """Pydantic Field(gt=0) on Optional duration_seconds rejects None as missing
    only when explicitly provided as <=0; the permit module rejects missing
    duration with a 400."""
    _create_wallet(client)
    r = client.post(
        "/sniping/permit",
        json={
            "user_wallet": USER,
            "mode": PermitMode.DEGEN.value,
            "budget_lamports_max": 1_000,
        },
    )
    assert r.status_code == 400


def test_negative_budget_is_422(client):
    _create_wallet(client)
    r = client.post(
        "/sniping/permit",
        json={
            "user_wallet": USER,
            "mode": PermitMode.FULL_TRUST.value,
            "budget_lamports_max": -1,
        },
    )
    assert r.status_code == 422  # pydantic Field(gt=0) catches this


def test_revoke_permit_marks_inactive(client):
    _create_wallet(client)
    permit = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=10_000).json()
    r = client.delete(f"/sniping/permit/{permit['id']}")
    assert r.status_code == 200
    revoked = r.json()
    assert revoked["revoked_at"] is not None
    assert revoked["is_active"] is False


def test_revoke_unknown_permit_404(client):
    r = client.delete("/sniping/permit/does-not-exist")
    assert r.status_code == 404


def test_list_permits_isolates_users(client):
    user_a = "11111111111111111111111111111111"
    user_b = "So11111111111111111111111111111111111111112"
    _create_wallet(client, user=user_a)
    _create_wallet(client, user=user_b)
    _create_permit(client, mode=PermitMode.FULL_TRUST, user=user_a, budget=100)
    _create_permit(client, mode=PermitMode.FULL_TRUST, user=user_b, budget=200)

    only_a = client.get("/sniping/permits", params={"user": user_a}).json()
    only_b = client.get("/sniping/permits", params={"user": user_b}).json()
    assert len(only_a) == 1 and only_a[0]["user_wallet"] == user_a
    assert len(only_b) == 1 and only_b[0]["user_wallet"] == user_b


def test_dryrun_snipe_consumes_budget(client):
    _create_wallet(client)
    permit = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=10_000).json()

    r = client.post(
        "/sniping/snipe/dryrun",
        json={
            "permit_id": permit["id"],
            "token_mint": TOKEN,
            "amount_lamports": 2_500,
        },
    )
    assert r.status_code == 200, r.text
    snipe = r.json()
    assert snipe["status"] == "dry_run"
    assert snipe["tx_signature"].startswith("DRYRUN-")

    # Budget reflected in subsequent permit listing.
    permits = client.get("/sniping/permits", params={"user": USER}).json()
    assert permits[0]["budget_lamports_used"] == 2_500


def test_dryrun_snipe_blocks_revoked_permit(client):
    _create_wallet(client)
    permit = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=10_000).json()
    client.delete(f"/sniping/permit/{permit['id']}")

    r = client.post(
        "/sniping/snipe/dryrun",
        json={
            "permit_id": permit["id"],
            "token_mint": TOKEN,
            "amount_lamports": 100,
        },
    )
    assert r.status_code == 403


def test_dryrun_snipe_blocks_budget_overflow(client):
    _create_wallet(client)
    permit = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=1_000).json()

    ok = client.post(
        "/sniping/snipe/dryrun",
        json={
            "permit_id": permit["id"],
            "token_mint": TOKEN,
            "amount_lamports": 800,
        },
    )
    assert ok.status_code == 200

    blocked = client.post(
        "/sniping/snipe/dryrun",
        json={
            "permit_id": permit["id"],
            "token_mint": TOKEN,
            "amount_lamports": 300,
        },
    )
    assert blocked.status_code == 403


def test_dryrun_snipe_rejects_invalid_token(client):
    _create_wallet(client)
    permit = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=10_000).json()
    r = client.post(
        "/sniping/snipe/dryrun",
        json={
            "permit_id": permit["id"],
            "token_mint": "not-a-pubkey",
            "amount_lamports": 100,
        },
    )
    assert r.status_code == 400


def test_dryrun_endpoint_disabled_when_dry_run_off(client, monkeypatch):
    monkeypatch.setenv("SHADE_DRY_RUN", "false")
    _create_wallet(client)
    permit = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=10_000).json()
    r = client.post(
        "/sniping/snipe/dryrun",
        json={
            "permit_id": permit["id"],
            "token_mint": TOKEN,
            "amount_lamports": 100,
        },
    )
    assert r.status_code == 400


def test_get_side_wallet_404_for_unknown_user(client):
    r = client.get("/sniping/wallet", params={"user": USER})
    assert r.status_code == 404


def test_list_snipes_records(client):
    _create_wallet(client)
    permit = _create_permit(client, mode=PermitMode.FULL_TRUST, budget=10_000).json()
    client.post(
        "/sniping/snipe/dryrun",
        json={
            "permit_id": permit["id"],
            "token_mint": TOKEN,
            "amount_lamports": 1_000,
        },
    )
    r = client.get("/sniping/snipes", params={"user": USER})
    assert r.status_code == 200
    snipes = r.json()
    assert len(snipes) == 1
    assert snipes[0]["amount_lamports"] == 1_000
