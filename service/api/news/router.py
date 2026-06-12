from fastapi import APIRouter, Depends, HTTPException

from .config import load_config
from .fetcher import fetch_channel
from .schemas import (
    AddChannelRequest,
    Channel,
    NewsFeedResponse,
    NewsPost,
)
from .storage import NewsStore, get_store

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=NewsFeedResponse)
def get_feed(store: NewsStore = Depends(get_store)) -> NewsFeedResponse:
    """
    Feed agrégé des canaux actifs.

    Stratégie : cache frais → live → cache périmé (secours). Garantit un feed
    plein même si la source live est indisponible au moment de la requête.
    """
    cfg = load_config()
    all_posts: list[dict] = []
    served_from_cache = False

    for channel in store.list_channels():
        if not channel["active"]:
            continue
        handle = channel["handle"]

        # 1. Cache encore valide → on l'utilise tel quel.
        if store.is_cache_fresh(handle):
            cached = store.get_cached_posts(handle)
            if cached:
                all_posts.extend(cached)
                continue

        # 2. Tentative de récupération live.
        result = fetch_channel(handle, cfg)
        if result is not None and result["posts"]:
            store.update_channel_profile(
                handle, result.get("display_name"), result.get("avatar")
            )
            store.set_cached_posts(handle, result["posts"])
            all_posts.extend(result["posts"])
            continue

        # 3. Échec live → on sert le dernier cache connu (même périmé).
        stale = store.get_cached_posts(handle)
        if stale:
            served_from_cache = True
            all_posts.extend(stale)

    # Tri antéchronologique ; les posts sans date connue passent en fin.
    all_posts.sort(key=lambda p: p.get("created_at") or "", reverse=True)

    return NewsFeedResponse(
        posts=[NewsPost(**p) for p in all_posts],
        from_cache=served_from_cache,
    )


@router.get("/channels", response_model=list[Channel])
def list_channels(store: NewsStore = Depends(get_store)) -> list[Channel]:
    return [Channel(**c) for c in store.list_channels()]


@router.post("/channels", response_model=Channel)
def add_channel(
    req: AddChannelRequest, store: NewsStore = Depends(get_store)
) -> Channel:
    handle = req.handle.strip().lstrip("@")
    if not handle:
        raise HTTPException(400, "handle vide")
    return Channel(**store.add_channel(handle))


@router.delete("/channels/{handle}")
def remove_channel(handle: str, store: NewsStore = Depends(get_store)) -> dict:
    if not store.remove_channel(handle):
        raise HTTPException(404, "canal introuvable")
    return {"removed": handle}
