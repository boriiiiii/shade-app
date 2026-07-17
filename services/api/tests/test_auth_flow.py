"""Flux Auth de bout en bout (nonce → signature → JWT → /me), via l'API réelle."""
from __future__ import annotations

import base58
import nacl.signing


def _keypair() -> tuple[nacl.signing.SigningKey, str]:
    sk = nacl.signing.SigningKey.generate()
    return sk, base58.b58encode(bytes(sk.verify_key)).decode()


async def test_full_login_flow(client) -> None:
    sk, address = _keypair()

    r = await client.post("/auth/nonce", json={"wallet_address": address})
    assert r.status_code == 200, r.text
    body = r.json()
    message, nonce = body["message"], body["nonce"]

    signature = base58.b58encode(sk.sign(message.encode()).signature).decode()
    r = await client.post(
        "/auth/verify",
        json={"wallet_address": address, "nonce": nonce, "signature": signature},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    assert r.json()["user"]["wallet_address"] == address

    r = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["wallet_address"] == address


async def test_nonce_is_single_use(client) -> None:
    sk, address = _keypair()
    nonce_resp = (await client.post("/auth/nonce", json={"wallet_address": address})).json()
    signature = base58.b58encode(sk.sign(nonce_resp["message"].encode()).signature).decode()
    payload = {"wallet_address": address, "nonce": nonce_resp["nonce"], "signature": signature}

    assert (await client.post("/auth/verify", json=payload)).status_code == 200
    # Rejeu avec le même nonce → refusé.
    replay = await client.post("/auth/verify", json=payload)
    assert replay.status_code == 400


async def test_bad_signature_rejected(client) -> None:
    sk, address = _keypair()
    nonce_resp = (await client.post("/auth/nonce", json={"wallet_address": address})).json()
    bad = base58.b58encode(b"\x00" * 64).decode()
    r = await client.post(
        "/auth/verify",
        json={"wallet_address": address, "nonce": nonce_resp["nonce"], "signature": bad},
    )
    assert r.status_code == 401


async def test_me_requires_auth(client) -> None:
    assert (await client.get("/auth/me")).status_code == 401


async def test_health(client) -> None:
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
