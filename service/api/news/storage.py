"""
Store en mémoire pour les canaux et le cache des posts.

Même philosophie que le store du module `sniping` : source de vérité unique
en mémoire, destinée à être remplacée par Supabase plus tard (même surface de
méthodes). Le cache par canal garantit un feed toujours plein pendant une démo,
même si la source live est momentanément indisponible.
"""
import threading
import time
from typing import Optional

from .config import NewsConfig, load_config


class NewsStore:
    def __init__(self, cfg: Optional[NewsConfig] = None) -> None:
        self._cfg = cfg or load_config()
        self._lock = threading.Lock()
        # handle (minuscule) -> {"handle", "display_name", "avatar", "active"}
        self._channels: dict[str, dict] = {}
        # handle (minuscule) -> {"posts": list[dict], "fetched_at": float}
        self._cache: dict[str, dict] = {}

        # Seed des canaux par défaut (démo : canaux globaux).
        for handle in self._cfg.default_handles:
            self._channels[handle.lower()] = {
                "handle": handle,
                "display_name": None,
                "avatar": None,
                "active": True,
            }

    # --- canaux ---

    def list_channels(self) -> list[dict]:
        with self._lock:
            return [dict(c) for c in self._channels.values()]

    def add_channel(self, handle: str) -> dict:
        key = handle.lstrip("@").lower()
        with self._lock:
            existing = self._channels.get(key)
            if existing is not None:
                existing["active"] = True
                return dict(existing)
            record = {
                "handle": handle.lstrip("@"),
                "display_name": None,
                "avatar": None,
                "active": True,
            }
            self._channels[key] = record
            return dict(record)

    def remove_channel(self, handle: str) -> bool:
        key = handle.lstrip("@").lower()
        with self._lock:
            removed = self._channels.pop(key, None) is not None
            self._cache.pop(key, None)
            return removed

    def update_channel_profile(
        self, handle: str, display_name: Optional[str], avatar: Optional[str]
    ) -> None:
        """Met à jour le nom affiché / avatar découverts lors d'un fetch."""
        key = handle.lstrip("@").lower()
        with self._lock:
            chan = self._channels.get(key)
            if chan is not None:
                if display_name:
                    chan["display_name"] = display_name
                if avatar:
                    chan["avatar"] = avatar

    # --- cache des posts ---

    def is_cache_fresh(self, handle: str) -> bool:
        key = handle.lstrip("@").lower()
        with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return False
            return (time.monotonic() - entry["fetched_at"]) < self._cfg.cache_ttl_seconds

    def get_cached_posts(self, handle: str) -> Optional[list[dict]]:
        key = handle.lstrip("@").lower()
        with self._lock:
            entry = self._cache.get(key)
            return list(entry["posts"]) if entry is not None else None

    def set_cached_posts(self, handle: str, posts: list[dict]) -> None:
        key = handle.lstrip("@").lower()
        with self._lock:
            self._cache[key] = {"posts": list(posts), "fetched_at": time.monotonic()}


_default_store = NewsStore()


def get_store() -> NewsStore:
    return _default_store
