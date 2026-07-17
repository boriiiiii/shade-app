"""Modèles ORM.

Choix de portabilité : identifiants en `Uuid` (natif Postgres, CHAR sur SQLite pour les
tests), montants on-chain en `BigInteger` (lamports / base units, u64 rentre dans un int64
signé pour toutes les valeurs réalistes), colonnes flexibles en `JSON`.

Les statuts/modes sont des chaînes courtes (voir `app.core.constants`), validés côté service
et Pydantic — pas d'ENUM Postgres natif pour éviter la friction de migration.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Uuid,
)
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import (
    DelegationStatus,
    OrderStatus,
)
from app.db.base import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    wallet_address: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    chain: Mapped[str] = mapped_column(String(32), default="solana-devnet")
    subscription_tier: Mapped[str] = mapped_column(String(32), default="free")
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)

    sessions: Mapped[list["Session"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class AuthNonce(Base):
    """Nonce de login usage-unique, à expiration courte (anti-rejeu)."""

    __tablename__ = "auth_nonces"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    wallet_address: Mapped[str] = mapped_column(String(64), index=True)
    nonce: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    message: Mapped[str] = mapped_column(Text)  # message humain-lisible réellement signé
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Session(TimestampMixin, Base):
    """Session applicative adossée à un JWT (jti), révocable."""

    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    jti: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user: Mapped[User] = relationship(back_populates="sessions")


class Delegation(TimestampMixin, Base):
    """Délégation SPL (Approve) d'un montant borné vers le side wallet.

    C'est le garde-fou *on-chain* (montant plafonné) + la police *off-chain* (durée, budget
    résiduel) réévaluée à chaque exécution. Voir ADR 0001.
    """

    __tablename__ = "delegations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mode: Mapped[str] = mapped_column(String(16))  # degen | full_trust
    token_mint: Mapped[str] = mapped_column(String(64))
    token_account: Mapped[str] = mapped_column(String(64))       # ATA de l'utilisateur, approuvé
    delegate_pubkey: Mapped[str] = mapped_column(String(64))     # side wallet (délégataire)
    amount_max: Mapped[int] = mapped_column(BigInteger)          # base units (plafond dur on-chain)
    amount_spent: Mapped[int] = mapped_column(BigInteger, default=0)
    duration_seconds: Mapped[int] = mapped_column(Integer)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(16), default=DelegationStatus.pending.value)
    approve_tx_sig: Mapped[str | None] = mapped_column(String(128), nullable=True)
    revoke_tx_sig: Mapped[str | None] = mapped_column(String(128), nullable=True)

    @property
    def amount_remaining(self) -> int:
        return max(0, self.amount_max - self.amount_spent)


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mode: Mapped[str] = mapped_column(String(16))     # manual | degen | full_trust
    status: Mapped[str] = mapped_column(String(16), default=OrderStatus.draft.value, index=True)
    side: Mapped[str] = mapped_column(String(8))      # buy | sell
    source: Mapped[str] = mapped_column(String(16), default="manual")  # manual|copytrade|snipe
    source_ref: Mapped[str | None] = mapped_column(String(64), nullable=True)

    input_mint: Mapped[str] = mapped_column(String(64))
    output_mint: Mapped[str] = mapped_column(String(64))
    input_amount: Mapped[int] = mapped_column(BigInteger)
    min_output_amount: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    quoted_output_amount: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    slippage_bps: Mapped[int] = mapped_column(Integer)
    route: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    delegation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("delegations.id", ondelete="SET NULL"), nullable=True
    )

    unsigned_tx: Mapped[str | None] = mapped_column(Text, nullable=True)  # base64
    tx_signature: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    failure_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # PnL indicatif (devnet) : réalisé lorsque success.
    realized_pnl: Mapped[int | None] = mapped_column(BigInteger, nullable=True)


class TraderProfile(Base):
    """Trader que l'on peut copier."""

    __tablename__ = "trader_profiles"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    wallet_address: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(64))
    stats: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class CopyConfig(TimestampMixin, Base):
    __tablename__ = "copy_configs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trader_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trader_profiles.id", ondelete="CASCADE"))
    position_size: Mapped[int] = mapped_column(BigInteger)   # base units par trade copié
    max_budget: Mapped[int] = mapped_column(BigInteger)      # budget total
    slippage_bps: Mapped[int] = mapped_column(Integer, default=100)
    token_whitelist: Mapped[list] = mapped_column(JSON, default=list)
    frequency_seconds: Mapped[int] = mapped_column(Integer, default=0)  # 0 = pas de throttle
    delegation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("delegations.id", ondelete="SET NULL"), nullable=True
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)


class SnipeConfig(TimestampMixin, Base):
    __tablename__ = "snipe_configs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    max_position: Mapped[int] = mapped_column(BigInteger)
    slippage_bps: Mapped[int] = mapped_column(Integer, default=200)
    max_latency_ms: Mapped[int] = mapped_column(Integer, default=5000)
    risk_limits: Mapped[dict] = mapped_column(JSON, default=dict)
    token_whitelist: Mapped[list] = mapped_column(JSON, default=list)
    delegation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("delegations.id", ondelete="SET NULL"), nullable=True
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)


class AuditLog(Base):
    """Journal append-only : chaque tentative d'exécution (acceptée ou rejetée)."""

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True, index=True)
    order_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(64))       # ex: order.prepare, order.execute
    decision: Mapped[str] = mapped_column(String(16))     # accepted | rejected
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
