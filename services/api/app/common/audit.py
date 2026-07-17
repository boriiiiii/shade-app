"""Journal d'audit append-only : chaque tentative d'exécution, acceptée ou rejetée."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import AuditDecision
from app.db.models import AuditLog


async def record_audit(
    db: AsyncSession,
    *,
    action: str,
    decision: AuditDecision,
    user_id: uuid.UUID | None = None,
    order_id: uuid.UUID | None = None,
    reason: str | None = None,
    meta: dict | None = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        order_id=order_id,
        action=action,
        decision=decision.value,
        reason=reason,
        meta=meta or {},
    )
    db.add(entry)
    await db.flush()
    return entry
