"""Énumérations métier (stockées en base sous forme de chaînes courtes)."""
from __future__ import annotations

import enum


class ExecutionMode(str, enum.Enum):
    manual = "manual"
    degen = "degen"
    full_trust = "full_trust"


class OrderStatus(str, enum.Enum):
    draft = "draft"
    ready_to_sign = "ready_to_sign"  # tx reconstruite + validée, en attente de signature wallet
    pending = "pending"              # broadcastée on-chain, en attente de confirmation
    success = "success"
    failed = "failed"
    rejected = "rejected"            # refusée par la validation serveur (jamais broadcastée)
    cancelled = "cancelled"


class OrderSide(str, enum.Enum):
    buy = "buy"
    sell = "sell"


class OrderSource(str, enum.Enum):
    manual = "manual"
    copytrade = "copytrade"
    snipe = "snipe"


class DelegationStatus(str, enum.Enum):
    pending = "pending"    # tx approve construite, pas encore confirmée on-chain
    active = "active"
    revoked = "revoked"
    expired = "expired"


class AuditDecision(str, enum.Enum):
    accepted = "accepted"
    rejected = "rejected"


# Mints devnet connus + whitelist par défaut (surchargée par config copytrade/snipe).
WSOL_MINT = "So11111111111111111111111111111111111111112"
DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"  # USDC-Dev (Circle devnet)
# Sentinelle « SOL natif » (System Program id) — convention pour distinguer SOL de wSOL côté ordre.
NATIVE_SOL_SENTINEL = "11111111111111111111111111111111"

DEFAULT_TOKEN_WHITELIST: list[str] = [NATIVE_SOL_SENTINEL, WSOL_MINT, DEVNET_USDC_MINT]
