"""Configuration centralisée (12-factor : tout vient de l'environnement)."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Runtime ---
    env: str = "dev"

    # --- Database ---
    database_url: str = (
        "postgresql+asyncpg://shade:shade_dev_password@localhost:5432/shade"
    )

    # --- API / Auth ---
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    jwt_secret: str = "dev-only-insecure-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    nonce_ttl_seconds: int = 300
    cors_origins: str = "*"

    # --- Solana ---
    solana_network: str = "devnet"
    solana_rpc_url: str = "https://api.devnet.solana.com"
    solana_ws_url: str = "wss://api.devnet.solana.com"
    side_wallet_secret_key: str = ""
    default_delegation_mint: str = "So11111111111111111111111111111111111111112"

    # --- Bornes de sécurité (validation d'ordre) ---
    max_slippage_bps: int = 1000  # 10 % — plafond dur, un ordre au-delà est rejeté

    @property
    def cors_origins_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_prod(self) -> bool:
        return self.env.lower() == "prod"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
