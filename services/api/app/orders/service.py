"""Orchestration du flux Order : prepare → (submit | execute) → track, avec audit systématique.

Règles non négociables appliquées ici :
  - la transaction est TOUJOURS validée + (re)construite côté serveur, jamais issue telle quelle
    du client ;
  - en Degen / Full Trust, les bornes de délégation sont revérifiées À l'exécution (pas seulement
    à la préparation) — défense en profondeur ;
  - chaque tentative (acceptée ou rejetée) est journalisée dans `AuditLog` avec sa raison, et
    **persistée** même lorsqu'on renvoie une erreur (commit avant de lever l'exception, sinon la
    dépendance `get_db` annulerait le log par rollback).
"""
from __future__ import annotations

import base64
import uuid
from typing import NoReturn

from fastapi import HTTPException, status as http_status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.audit import record_audit
from app.core.config import settings
from app.core.constants import (
    DEFAULT_TOKEN_WHITELIST,
    AuditDecision,
    ExecutionMode,
    OrderStatus,
)
from app.db.models import Delegation, Order, User
from app.orders.builder import build_manual_order_tx
from app.orders.quoter import get_quote
from app.orders.schemas import PrepareOrderRequest
from app.orders.tracker import refresh_order_status
from app.orders.validation import (
    OrderValidationError,
    check_delegation_limits,
    validate_order_request,
)
from app.solana.client import SolanaClient
from app.wallet.service import delegation_backend

_DELEGATED_MODES = (ExecutionMode.degen, ExecutionMode.full_trust)


async def _load_order(db: AsyncSession, user: User, order_id: uuid.UUID) -> Order:
    order = await db.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Ordre introuvable")
    return order


async def _load_delegation(db: AsyncSession, user: User, delegation_id: uuid.UUID) -> Delegation:
    deleg = await db.get(Delegation, delegation_id)
    if deleg is None or deleg.user_id != user.id:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Délégation introuvable")
    return deleg


async def _audit_reject_and_raise(
    db: AsyncSession,
    *,
    user_id: uuid.UUID | None,
    action: str,
    err: OrderValidationError,
    order_id: uuid.UUID | None = None,
    meta: dict | None = None,
) -> NoReturn:
    """Journalise le rejet, COMMIT (durabilité de l'audit) puis lève une 422."""
    await record_audit(
        db,
        action=action,
        decision=AuditDecision.rejected,
        user_id=user_id,
        order_id=order_id,
        reason=f"{err.code}: {err.reason}",
        meta={"code": err.code, **(meta or {})},
    )
    await db.commit()
    raise HTTPException(
        http_status.HTTP_422_UNPROCESSABLE_ENTITY, {"code": err.code, "reason": err.reason}
    )


async def _audit_fail_and_raise(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    order: Order,
    action: str,
    exc: Exception,
) -> NoReturn:
    """Marque l'ordre en échec, journalise, COMMIT puis lève une 502."""
    order.status = OrderStatus.failed.value
    order.failure_reason = f"{action}: {exc}"[:255]
    await record_audit(
        db, action=action, decision=AuditDecision.rejected,
        user_id=user_id, order_id=order.id, reason=str(exc)[:255],
    )
    await db.commit()
    raise HTTPException(http_status.HTTP_502_BAD_GATEWAY, f"échec ({action}): {exc}")


async def prepare_order(db: AsyncSession, user: User, req: PrepareOrderRequest) -> Order:
    network = settings.solana_network
    quoted = req.quoted_output_amount or await get_quote(
        req.input_mint, req.output_mint, req.input_amount
    )
    whitelist = req.whitelist or DEFAULT_TOKEN_WHITELIST

    # 1) Validation générique (pure, sans I/O).
    try:
        validated = validate_order_request(
            input_mint=req.input_mint,
            output_mint=req.output_mint,
            input_amount=req.input_amount,
            slippage_bps=req.slippage_bps,
            quoted_output_amount=quoted,
            network=network,
            expected_network=network,
            max_slippage_bps=settings.max_slippage_bps,
            whitelist=whitelist,
        )
    except OrderValidationError as err:
        await _audit_reject_and_raise(db, user_id=user.id, action="order.prepare", err=err)

    # 2) Modes délégués : délégation obligatoire + bornes revérifiées.
    delegation: Delegation | None = None
    if req.mode in _DELEGATED_MODES:
        if req.delegation_id is None:
            await _audit_reject_and_raise(
                db, user_id=user.id, action="order.prepare",
                err=OrderValidationError("delegation_required", "délégation requise pour ce mode"),
            )
        delegation = await _load_delegation(db, user, req.delegation_id)
        if req.input_mint != delegation.token_mint:
            await _audit_reject_and_raise(
                db, user_id=user.id, action="order.prepare",
                err=OrderValidationError(
                    "mint_not_delegated", "le mint d'entrée ne correspond pas à la délégation"
                ),
                meta={"delegation_id": str(delegation.id)},
            )
        try:
            check_delegation_limits(delegation, amount=req.input_amount, mode=req.mode)
        except OrderValidationError as err:
            await _audit_reject_and_raise(
                db, user_id=user.id, action="order.prepare", err=err,
                meta={"delegation_id": str(delegation.id)},
            )

    # 3) Construction de la tx (reconstruite serveur).
    unsigned_tx: str | None = None
    if req.mode == ExecutionMode.manual:
        unsigned_tx, route = await build_manual_order_tx(
            owner=user.wallet_address, input_amount=validated.input_amount
        )
    else:
        route = {"kind": "delegated_execution", "executor": "side_wallet", "mode": req.mode.value}

    order = Order(
        user_id=user.id,
        mode=req.mode.value,
        status=OrderStatus.ready_to_sign.value,
        side=req.side.value,
        source=req.source.value,
        source_ref=req.source_ref,
        input_mint=req.input_mint,
        output_mint=req.output_mint,
        input_amount=validated.input_amount,
        min_output_amount=validated.min_output_amount,
        quoted_output_amount=quoted,
        slippage_bps=validated.slippage_bps,
        route=route,
        delegation_id=delegation.id if delegation else None,
        unsigned_tx=unsigned_tx,
    )
    db.add(order)
    await db.flush()
    await record_audit(
        db,
        action="order.prepare",
        decision=AuditDecision.accepted,
        user_id=user.id,
        order_id=order.id,
        meta={
            "mode": req.mode.value,
            "input_amount": validated.input_amount,
            "min_output": validated.min_output_amount,
            "slippage_bps": validated.slippage_bps,
        },
    )
    return order


async def submit_signed_order(
    db: AsyncSession, user: User, order_id: uuid.UUID, signed_tx_b64: str
) -> Order:
    """Mode Manuel : l'utilisateur a signé dans son wallet, le backend diffuse et suit."""
    order = await _load_order(db, user, order_id)
    if order.mode != ExecutionMode.manual.value:
        raise HTTPException(
            http_status.HTTP_400_BAD_REQUEST,
            "submit réservé au mode manuel ; utilisez /execute pour les modes délégués",
        )
    if order.status != OrderStatus.ready_to_sign.value:
        raise HTTPException(
            http_status.HTTP_409_CONFLICT, f"ordre non signable (statut={order.status})"
        )

    try:
        raw = base64.b64decode(signed_tx_b64)
    except Exception:
        raise HTTPException(http_status.HTTP_400_BAD_REQUEST, "signed_tx base64 invalide")

    client = SolanaClient()
    try:
        sig = await client.send_raw_transaction(raw)
    except Exception as exc:  # noqa: BLE001 — échec RPC → ordre en échec + audit durable
        await _audit_fail_and_raise(db, user_id=user.id, order=order, action="order.submit", exc=exc)
    finally:
        await client.close()

    order.tx_signature = sig
    order.status = OrderStatus.pending.value
    await record_audit(
        db, action="order.submit", decision=AuditDecision.accepted,
        user_id=user.id, order_id=order.id, meta={"tx_signature": sig},
    )
    return order


async def execute_delegated_order(db: AsyncSession, user: User, order_id: uuid.UUID) -> Order:
    """Mode Degen / Full Trust : exécution par le side wallet, dans les limites approuvées."""
    order = await _load_order(db, user, order_id)
    if order.mode not in (ExecutionMode.degen.value, ExecutionMode.full_trust.value):
        raise HTTPException(
            http_status.HTTP_400_BAD_REQUEST, "execute réservé aux modes degen / full_trust"
        )
    if order.status != OrderStatus.ready_to_sign.value:
        raise HTTPException(
            http_status.HTTP_409_CONFLICT, f"ordre non exécutable (statut={order.status})"
        )
    if order.delegation_id is None:
        raise HTTPException(http_status.HTTP_409_CONFLICT, "aucune délégation liée à l'ordre")

    delegation = await _load_delegation(db, user, order.delegation_id)

    # DÉFENSE EN PROFONDEUR : on revérifie les bornes AU MOMENT de l'exécution.
    try:
        check_delegation_limits(
            delegation, amount=order.input_amount, mode=ExecutionMode(order.mode)
        )
    except OrderValidationError as err:
        order.status = OrderStatus.rejected.value
        order.failure_reason = f"{err.code}: {err.reason}"[:255]
        await _audit_reject_and_raise(
            db, user_id=user.id, action="order.execute", err=err, order_id=order.id,
            meta={"delegation_id": str(delegation.id)},
        )

    try:
        sig = await delegation_backend.execute_delegated_transfer(
            source_ata=delegation.token_account,
            mint=delegation.token_mint,
            amount=order.input_amount,
        )
    except Exception as exc:  # noqa: BLE001
        await _audit_fail_and_raise(
            db, user_id=user.id, order=order, action="order.execute", exc=exc
        )

    # Consommation du budget (source de vérité off-chain) + suivi.
    delegation.amount_spent += order.input_amount
    order.tx_signature = sig
    order.status = OrderStatus.pending.value
    await record_audit(
        db, action="order.execute", decision=AuditDecision.accepted,
        user_id=user.id, order_id=order.id,
        meta={"tx_signature": sig, "amount": order.input_amount, "spent": delegation.amount_spent},
    )
    return order


async def get_order(db: AsyncSession, user: User, order_id: uuid.UUID, *, refresh: bool = True) -> Order:
    order = await _load_order(db, user, order_id)
    if refresh:
        await refresh_order_status(order)
    return order


async def list_orders(db: AsyncSession, user: User) -> tuple[list[Order], dict]:
    rows = (
        await db.execute(
            select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
        )
    ).scalars().all()

    aggregate_pnl = sum((o.realized_pnl or 0) for o in rows)
    success = sum(1 for o in rows if o.status == OrderStatus.success.value)
    failed = sum(1 for o in rows if o.status == OrderStatus.failed.value)
    return list(rows), {
        "aggregate_pnl": aggregate_pnl,
        "success_count": success,
        "failed_count": failed,
    }
