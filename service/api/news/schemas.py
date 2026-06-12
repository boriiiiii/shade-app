from typing import Optional

from pydantic import BaseModel, Field


class Channel(BaseModel):
    """Un compte suivi (canal)."""

    handle: str
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    active: bool = True


class AddChannelRequest(BaseModel):
    handle: str = Field(min_length=1, max_length=30)


class NewsPost(BaseModel):
    """Un post normalisé, indépendant de la plateforme source."""

    id: str
    handle: str
    author: str
    avatar: Optional[str] = None
    text: str
    media: list[str] = []  # URLs des images du post (0 à 4)
    url: str
    created_at: str  # ISO 8601
    source: str  # "nitter" | "syndication"


class NewsFeedResponse(BaseModel):
    posts: list[NewsPost]
    # True si au moins un canal a été servi depuis le cache (source live indisponible).
    from_cache: bool = False
