"""schéma initial

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-18
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("wallet_address", sa.String(64), nullable=False),
        sa.Column("chain", sa.String(32), nullable=False),
        sa.Column("subscription_tier", sa.String(32), nullable=False),
        sa.Column("preferences", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_wallet_address", "users", ["wallet_address"], unique=True)

    op.create_table(
        "auth_nonces",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("wallet_address", sa.String(64), nullable=False),
        sa.Column("nonce", sa.String(64), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_auth_nonces_wallet_address", "auth_nonces", ["wallet_address"])
    op.create_index("ix_auth_nonces_nonce", "auth_nonces", ["nonce"], unique=True)

    op.create_table(
        "trader_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("wallet_address", sa.String(64), nullable=False),
        sa.Column("label", sa.String(64), nullable=False),
        sa.Column("stats", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "ix_trader_profiles_wallet_address", "trader_profiles", ["wallet_address"], unique=True
    )

    op.create_table(
        "sessions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("jti", sa.String(64), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False),
        sa.Column("user_agent", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])
    op.create_index("ix_sessions_jti", "sessions", ["jti"], unique=True)

    op.create_table(
        "delegations",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("mode", sa.String(16), nullable=False),
        sa.Column("token_mint", sa.String(64), nullable=False),
        sa.Column("token_account", sa.String(64), nullable=False),
        sa.Column("delegate_pubkey", sa.String(64), nullable=False),
        sa.Column("amount_max", sa.BigInteger(), nullable=False),
        sa.Column("amount_spent", sa.BigInteger(), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("approve_tx_sig", sa.String(128), nullable=True),
        sa.Column("revoke_tx_sig", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_delegations_user_id", "delegations", ["user_id"])

    op.create_table(
        "orders",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("mode", sa.String(16), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("side", sa.String(8), nullable=False),
        sa.Column("source", sa.String(16), nullable=False),
        sa.Column("source_ref", sa.String(64), nullable=True),
        sa.Column("input_mint", sa.String(64), nullable=False),
        sa.Column("output_mint", sa.String(64), nullable=False),
        sa.Column("input_amount", sa.BigInteger(), nullable=False),
        sa.Column("min_output_amount", sa.BigInteger(), nullable=True),
        sa.Column("quoted_output_amount", sa.BigInteger(), nullable=True),
        sa.Column("slippage_bps", sa.Integer(), nullable=False),
        sa.Column("route", sa.JSON(), nullable=True),
        sa.Column("delegation_id", sa.Uuid(), nullable=True),
        sa.Column("unsigned_tx", sa.Text(), nullable=True),
        sa.Column("tx_signature", sa.String(128), nullable=True),
        sa.Column("failure_reason", sa.String(255), nullable=True),
        sa.Column("realized_pnl", sa.BigInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["delegation_id"], ["delegations.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_orders_tx_signature", "orders", ["tx_signature"])

    op.create_table(
        "copy_configs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("trader_id", sa.Uuid(), nullable=False),
        sa.Column("position_size", sa.BigInteger(), nullable=False),
        sa.Column("max_budget", sa.BigInteger(), nullable=False),
        sa.Column("slippage_bps", sa.Integer(), nullable=False),
        sa.Column("token_whitelist", sa.JSON(), nullable=False),
        sa.Column("frequency_seconds", sa.Integer(), nullable=False),
        sa.Column("delegation_id", sa.Uuid(), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["trader_id"], ["trader_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["delegation_id"], ["delegations.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_copy_configs_user_id", "copy_configs", ["user_id"])

    op.create_table(
        "snipe_configs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("max_position", sa.BigInteger(), nullable=False),
        sa.Column("slippage_bps", sa.Integer(), nullable=False),
        sa.Column("max_latency_ms", sa.Integer(), nullable=False),
        sa.Column("risk_limits", sa.JSON(), nullable=False),
        sa.Column("token_whitelist", sa.JSON(), nullable=False),
        sa.Column("delegation_id", sa.Uuid(), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["delegation_id"], ["delegations.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_snipe_configs_user_id", "snipe_configs", ["user_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("order_id", sa.Uuid(), nullable=True),
        sa.Column("action", sa.String(64), nullable=False),
        sa.Column("decision", sa.String(16), nullable=False),
        sa.Column("reason", sa.String(255), nullable=True),
        sa.Column("meta", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_order_id", "audit_logs", ["order_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("snipe_configs")
    op.drop_table("copy_configs")
    op.drop_table("orders")
    op.drop_table("delegations")
    op.drop_table("sessions")
    op.drop_table("trader_profiles")
    op.drop_table("auth_nonces")
    op.drop_table("users")
