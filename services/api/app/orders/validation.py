"""Validation d'ordre côté serveur — fonctions PURES (aucune I/O, entièrement testables).

C'est le cœur de la confiance : rien de ce que le client envoie n'est pris pour argent comptant.
Le backend recalcule le `min_output` autoritatif à partir du quote et du slippage, refuse hors
whitelist / mauvaise chaîne / montants incohérents, et — pour Degen/Full Trust — revérifie les
bornes de délégation (statut, durée, budget résiduel) à CHAQUE exécution.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol

from app.core.constants import DelegationStatus, ExecutionMode


class OrderValidationError(Exception):
    """Rejet de validation, porteur d'un code machine + d'une raison lisible (pour l'audit)."""

    def __init__(self, code: str, reason: str) -> None:
        self.code = code
        self.reason = reason
        super().__init__(reason)


@dataclass
class ValidatedOrder:
    input_mint: str
    output_mint: str
    input_amount: int
    min_output_amount: int
    slippage_bps: int


class DelegationLike(Protocol):
    status: str
    mode: str
    expires_at: datetime
    amount_max: int
    amount_spent: int
    token_mint: str


def _is_probably_address(value: str) -> bool:
    # Contrôle bon marché ; la validité base58/32-octets est vérifiée plus haut (crypto).
    return isinstance(value, str) and 32 <= len(value) <= 64


def validate_order_request(
    *,
    input_mint: str,
    output_mint: str,
    input_amount: int,
    slippage_bps: int,
    quoted_output_amount: int,
    network: str,
    expected_network: str,
    max_slippage_bps: int,
    whitelist: list[str],
) -> ValidatedOrder:
    """Valide une intention d'ordre et renvoie l'ordre normalisé (min_output recalculé serveur).

    Lève `OrderValidationError` au premier problème.
    """
    if network != expected_network:
        raise OrderValidationError(
            "wrong_chain", f"chaîne '{network}' refusée (attendu '{expected_network}')"
        )

    if not _is_probably_address(input_mint) or not _is_probably_address(output_mint):
        raise OrderValidationError("bad_mint", "mint d'entrée ou de sortie invalide")

    if input_mint == output_mint:
        raise OrderValidationError("same_mint", "les mints d'entrée et de sortie sont identiques")

    if input_amount <= 0:
        raise OrderValidationError("bad_amount", "le montant d'entrée doit être strictement positif")

    if slippage_bps < 0 or slippage_bps > max_slippage_bps:
        raise OrderValidationError(
            "slippage_too_high",
            f"slippage {slippage_bps} bps hors bornes [0, {max_slippage_bps}]",
        )

    effective_whitelist = whitelist or []
    if effective_whitelist:
        for mint in (input_mint, output_mint):
            if mint not in effective_whitelist:
                raise OrderValidationError(
                    "not_whitelisted", f"token {mint} absent de la whitelist"
                )

    if quoted_output_amount <= 0:
        raise OrderValidationError("bad_quote", "quote de sortie invalide")

    # min_output AUTORITATIF, recalculé serveur — le client ne peut pas l'abaisser.
    min_output_amount = (quoted_output_amount * (10_000 - slippage_bps)) // 10_000
    if min_output_amount <= 0:
        raise OrderValidationError("bad_min_output", "min_output calculé nul")

    return ValidatedOrder(
        input_mint=input_mint,
        output_mint=output_mint,
        input_amount=input_amount,
        min_output_amount=min_output_amount,
        slippage_bps=slippage_bps,
    )


def check_delegation_limits(
    delegation: DelegationLike,
    *,
    amount: int,
    mode: ExecutionMode,
    now: datetime | None = None,
) -> None:
    """Revérifie les bornes de la délégation AVANT chaque exécution déléguée.

    Vérifie : statut actif, mode cohérent, non expirée (durée), budget résiduel suffisant.
    Lève `OrderValidationError` sinon. Appelée à CHAQUE trade, pas seulement à l'approbation.
    """
    now = now or datetime.now(timezone.utc)

    if delegation.status != DelegationStatus.active.value:
        raise OrderValidationError(
            "delegation_inactive", f"délégation non active (statut={delegation.status})"
        )

    if delegation.mode != mode.value:
        raise OrderValidationError(
            "delegation_mode_mismatch",
            f"délégation en mode '{delegation.mode}', requis '{mode.value}'",
        )

    expires_at = delegation.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if now >= expires_at:
        raise OrderValidationError("delegation_expired", "durée de délégation dépassée")

    if amount <= 0:
        raise OrderValidationError("bad_amount", "montant d'exécution invalide")

    if delegation.amount_spent + amount > delegation.amount_max:
        raise OrderValidationError(
            "budget_exceeded",
            f"budget dépassé : {delegation.amount_spent}+{amount} > {delegation.amount_max}",
        )
