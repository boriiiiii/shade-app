import os
from dataclasses import dataclass


@dataclass(frozen=True)
class SnipingConfig:
    rpc_url: str
    network: str
    dry_run: bool


def load_config() -> SnipingConfig:
    return SnipingConfig(
        rpc_url=os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com"),
        network=os.getenv("SOLANA_NETWORK", "devnet"),
        dry_run=os.getenv("SHADE_DRY_RUN", "true").lower() in ("1", "true", "yes"),
    )
