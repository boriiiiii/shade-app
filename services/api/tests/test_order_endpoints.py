"""Endpoints Order : rejets validés côté serveur + durabilité de l'audit (même en erreur)."""
from __future__ import annotations

import base58
import nacl.signing
from sqlalchemy import select

from app.core.constants import DEVNET_USDC_MINT, NATIVE_SOL_SENTINEL, WSOL_MINT
from app.db.models import AuditLog


async def _auth_headers(client) -> dict[str, str]:
    sk = nacl.signing.SigningKey.generate()
    address = base58.b58encode(bytes(sk.verify_key)).decode()
    nonce_resp = (await client.post("/auth/nonce", json={"wallet_address": address})).json()
    signature = base58.b58encode(sk.sign(nonce_resp["message"].encode()).signature).decode()
    token = (
        await client.post(
            "/auth/verify",
            json={"wallet_address": address, "nonce": nonce_resp["nonce"], "signature": signature},
        )
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def test_prepare_rejects_high_slippage_and_persists_audit(client, db_session) -> None:
    headers = await _auth_headers(client)
    resp = await client.post(
        "/orders/prepare",
        headers=headers,
        json={
            "mode": "manual",
            "input_mint": NATIVE_SOL_SENTINEL,
            "output_mint": WSOL_MINT,
            "input_amount": 1_000_000,
            "slippage_bps": 5000,  # > max (1000)
        },
    )
    assert resp.status_code == 422, resp.text
    assert resp.json()["detail"]["code"] == "slippage_too_high"

    # L'audit de REJET doit survivre à la réponse d'erreur (commit avant raise).
    rows = (
        await db_session.execute(select(AuditLog).where(AuditLog.decision == "rejected"))
    ).scalars().all()
    assert any(a.action == "order.prepare" for a in rows)


async def test_prepare_degen_without_delegation_rejected_and_audited(client, db_session) -> None:
    headers = await _auth_headers(client)
    resp = await client.post(
        "/orders/prepare",
        headers=headers,
        json={
            "mode": "degen",
            "input_mint": WSOL_MINT,
            "output_mint": DEVNET_USDC_MINT,
            "input_amount": 1_000_000,
            "slippage_bps": 100,
        },
    )
    assert resp.status_code == 422, resp.text
    assert resp.json()["detail"]["code"] == "delegation_required"

    rows = (
        await db_session.execute(select(AuditLog).where(AuditLog.decision == "rejected"))
    ).scalars().all()
    assert len(rows) >= 1


async def test_prepare_requires_auth(client) -> None:
    resp = await client.post(
        "/orders/prepare",
        json={
            "mode": "manual",
            "input_mint": NATIVE_SOL_SENTINEL,
            "output_mint": WSOL_MINT,
            "input_amount": 1_000_000,
        },
    )
    assert resp.status_code == 401
