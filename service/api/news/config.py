"""Configuration du module News (agrégation de comptes Twitter/X)."""
from dataclasses import dataclass, field


@dataclass(frozen=True)
class NewsConfig:
    """Paramètres de récupération et de cache des posts."""

    # Comptes mis en avant par défaut pour la démo (canaux globaux).
    default_handles: tuple[str, ...] = ("solana", "CoinDesk", "ShadeCrypto")

    # Instances Nitter essayées dans l'ordre (résilience : on prend la 1re qui répond).
    nitter_instances: tuple[str, ...] = (
        "https://nitter.net",
        "https://nitter.poast.org",
        "https://lightbrd.com",
        "https://nitter.privacyredirect.com",
    )

    # Endpoint de syndication X, utilisé en dernier recours.
    syndication_url: str = (
        "https://syndication.twitter.com/srv/timeline-profile/screen-name/{handle}"
    )

    # Durée de validité du cache d'un canal, en secondes.
    cache_ttl_seconds: int = 300

    # Nombre maximum de posts conservés par canal.
    max_posts_per_channel: int = 15

    # Timeout des requêtes HTTP sortantes, en secondes.
    http_timeout: float = 12.0

    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )


_config = NewsConfig()


def load_config() -> NewsConfig:
    return _config
