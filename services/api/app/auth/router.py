"""Flux Auth (diagramme Login) : nonce → signature Ed25519 → JWT.

Seules données stockées : adresse publique, chaîne, préférences, métadonnées de session,
abonnement. Jamais de clé privée.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import (
    NonceRequest,
    NonceResponse,
    TokenResponse,
    UserOut,
    VerifyRequest,
)
from app.auth.security import create_access_token, get_current_user
from app.auth.service import build_login_message, generate_nonce
from app.core.config import settings
from app.db.models import AuthNonce, Session, User
from app.db.session import get_db
from app.solana.crypto import is_valid_solana_address, verify_signature

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/nonce", response_model=NonceResponse)
async def request_nonce(payload: NonceRequest, db: AsyncSession = Depends(get_db)) -> NonceResponse:
    if not is_valid_solana_address(payload.wallet_address):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Adresse Solana invalide")

    issued_at = datetime.now(timezone.utc)
    nonce = generate_nonce()
    message = build_login_message(payload.wallet_address, nonce, issued_at)
    expires_at = issued_at + timedelta(seconds=settings.nonce_ttl_seconds)

    db.add(
        AuthNonce(
            wallet_address=payload.wallet_address,
            nonce=nonce,
            message=message,
            expires_at=expires_at,
        )
    )
    return NonceResponse(
        wallet_address=payload.wallet_address,
        nonce=nonce,
        message=message,
        expires_at=expires_at,
    )


@router.post("/verify", response_model=TokenResponse)
async def verify_signature_and_login(
    payload: VerifyRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    row = (
        await db.execute(
            select(AuthNonce).where(
                AuthNonce.nonce == payload.nonce,
                AuthNonce.wallet_address == payload.wallet_address,
            )
        )
    ).scalar_one_or_none()

    if row is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nonce inconnu")
    if row.used:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nonce déjà utilisé (anti-rejeu)")
    if _aware(row.expires_at) < datetime.now(timezone.utc):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nonce expiré")

    # Vérifie la signature contre le message EXACT stocké (pas de reconstruction côté serveur).
    if not verify_signature(payload.wallet_address, row.message, payload.signature):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Signature invalide")

    # Nonce consommé immédiatement (usage unique).
    row.used = True

    # Upsert utilisateur.
    user = (
        await db.execute(select(User).where(User.wallet_address == payload.wallet_address))
    ).scalar_one_or_none()
    if user is None:
        user = User(wallet_address=payload.wallet_address, chain=f"solana-{settings.solana_network}")
        db.add(user)
        await db.flush()

    # Session + JWT.
    jti = uuid.uuid4().hex
    token, expires_at = create_access_token(user.id, jti)
    db.add(
        Session(
            user_id=user.id,
            jti=jti,
            expires_at=expires_at,
            user_agent=request.headers.get("user-agent"),
        )
    )

    return TokenResponse(
        access_token=token,
        expires_at=expires_at,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> Response:
    # Révoque toutes les sessions actives de l'utilisateur.
    sessions = (
        await db.execute(
            select(Session).where(Session.user_id == current_user.id, Session.revoked.is_(False))
        )
    ).scalars()
    for s in sessions:
        s.revoked = True
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _aware(dt: datetime) -> datetime:
    """Normalise en tz-aware (SQLite peut renvoyer des datetimes naïfs)."""
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)
