"""Point d'entrée FastAPI — assemble les routers Auth / Wallet / Orders / Copytrade / Sniping."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.copytrade.router import router as copytrade_router
from app.copytrade.service import seed_default_traders
from app.core.config import settings
from app.db import models  # noqa: F401 — enregistre les tables sur Base.metadata
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.orders.router import router as orders_router
from app.sniping.router import router as sniping_router
from app.wallet.router import router as wallet_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # En dev : create_all (idempotent, no-op si Alembic a déjà migré) + seed démo.
    # En prod : les migrations Alembic font foi, pas de create_all automatique.
    if not settings.is_prod:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with SessionLocal() as db:
            await seed_default_traders(db)
            await db.commit()
    yield
    await engine.dispose()


app = FastAPI(
    title="Shade API",
    version="0.1.0",
    description="Backend non-custodial de trading automatisé sur Solana devnet.",
    lifespan=lifespan,
)

_origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    # credentials incompatibles avec '*' ; l'auth passe par le header Authorization, pas un cookie.
    allow_credentials="*" not in _origins,
)


@app.get("/health", tags=["meta"])
async def health() -> dict:
    return {"status": "ok", "env": settings.env, "network": settings.solana_network}


app.include_router(auth_router)
app.include_router(wallet_router)
app.include_router(orders_router)
app.include_router(copytrade_router)
app.include_router(sniping_router)
