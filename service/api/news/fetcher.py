"""
Récupération des derniers posts d'un compte Twitter/X, gratuitement.

Stratégie en cascade :
  1. Instances Nitter (RSS propre) — essayées dans l'ordre.
  2. Endpoint de syndication X — dernier recours (parsing tolérant).

Chaque post est normalisé dans un format unique, indépendant de la source.
Aucune clé d'API requise.
"""
import re
from email.utils import parsedate_to_datetime
from urllib.parse import unquote
from xml.etree import ElementTree

import httpx

from .config import NewsConfig

# <img src="..."> dans la description d'un item Nitter.
_IMG_RE = re.compile(r'<img[^>]+src="([^"]+)"')
# Balises HTML résiduelles à retirer pour obtenir du texte brut.
_TAG_RE = re.compile(r"<[^>]+>")


def _unproxy_media(url: str | None) -> str | None:
    """Convertit une URL d'image proxifiée par Nitter en URL d'origine (pbs.twimg.com)."""
    if not url:
        return None
    marker = "/pic/"
    idx = url.find(marker)
    if idx == -1:
        return url
    raw = unquote(url[idx + len(marker):])
    if raw.startswith("http"):
        return raw
    # L'URL contient l'hôte (ex. "pbs.twimg.com/...") → on préfixe juste le schéma.
    first_segment = raw.split("/", 1)[0]
    if "." in first_segment:
        return "https://" + raw
    # Sinon, chemin relatif au CDN média de Twitter.
    return "https://pbs.twimg.com/" + raw


def _strip_html(text: str) -> str:
    return _TAG_RE.sub("", text).strip()


def _to_iso(rfc822: str | None) -> str:
    if not rfc822:
        return ""
    try:
        return parsedate_to_datetime(rfc822).isoformat()
    except (TypeError, ValueError):
        return ""


def _parse_nitter_rss(handle: str, xml_text: str, cfg: NewsConfig) -> dict:
    """Parse un flux RSS Nitter en profil + liste de posts normalisés."""
    root = ElementTree.fromstring(xml_text)
    channel = root.find("channel")
    if channel is None:
        raise ValueError("flux RSS sans <channel>")

    # Profil : nom affiché ("CoinDesk / @CoinDesk") + avatar.
    title_el = channel.find("title")
    display_name = handle
    if title_el is not None and title_el.text:
        display_name = title_el.text.split(" / ")[0].strip() or handle

    avatar = None
    image_el = channel.find("image")
    if image_el is not None:
        url_el = image_el.find("url")
        if url_el is not None:
            avatar = _unproxy_media(url_el.text)

    posts: list[dict] = []
    for item in channel.findall("item")[: cfg.max_posts_per_channel]:
        guid_el = item.find("guid")
        tweet_id = (guid_el.text or "").strip() if guid_el is not None else ""

        title_text = item.findtext("title", default="") or ""
        description = item.findtext("description", default="") or ""
        text = title_text.strip() or _strip_html(description)

        # Toutes les images du tweet (jusqu'à 4), dédupliquées.
        media: list[str] = []
        for raw in _IMG_RE.findall(description):
            url = _unproxy_media(raw)
            if url and url not in media:
                media.append(url)
        media = media[:4]

        # On rattache chaque post au canal source (identité cohérente dans le feed),
        # y compris les retweets, plutôt qu'à l'auteur original du RSS.
        posts.append(
            {
                "id": tweet_id or f"{handle}-{len(posts)}",
                "handle": handle,
                "author": display_name,
                "avatar": avatar,
                "text": text,
                "media": media,
                "url": f"https://x.com/{handle}/status/{tweet_id}"
                if tweet_id
                else f"https://x.com/{handle}",
                "created_at": _to_iso(item.findtext("pubDate")),
                "source": "nitter",
            }
        )

    return {"display_name": display_name, "avatar": avatar, "posts": posts}


def _fetch_via_nitter(handle: str, cfg: NewsConfig, client: httpx.Client) -> dict | None:
    """Essaie chaque instance Nitter jusqu'à en trouver une qui répond correctement."""
    for base in cfg.nitter_instances:
        try:
            resp = client.get(f"{base}/{handle}/rss")
            if resp.status_code != 200 or "<rss" not in resp.text:
                continue
            parsed = _parse_nitter_rss(handle, resp.text, cfg)
            if parsed["posts"]:
                return parsed
        except (httpx.HTTPError, ElementTree.ParseError, ValueError):
            continue
    return None


# Extraction tolérante depuis la réponse de syndication (HTML + JSON imbriqué).
_FULLTEXT_RE = re.compile(r'"full_text":"((?:[^"\\]|\\.)*)"')
_IDSTR_RE = re.compile(r'"id_str":"(\d+)"')


def _fetch_via_syndication(
    handle: str, cfg: NewsConfig, client: httpx.Client
) -> dict | None:
    """Dernier recours : extrait les tweets depuis l'endpoint de syndication."""
    try:
        resp = client.get(cfg.syndication_url.format(handle=handle))
        if resp.status_code != 200:
            return None
    except httpx.HTTPError:
        return None

    texts = _FULLTEXT_RE.findall(resp.text)
    ids = _IDSTR_RE.findall(resp.text)
    if not texts:
        return None

    posts: list[dict] = []
    for i, raw_text in enumerate(texts[: cfg.max_posts_per_channel]):
        text = raw_text.encode().decode("unicode_escape", errors="ignore")
        tweet_id = ids[i] if i < len(ids) else ""
        posts.append(
            {
                "id": tweet_id or f"{handle}-syn-{i}",
                "handle": handle,
                "author": handle,
                "avatar": None,
                "text": text,
                "media": [],
                "url": f"https://x.com/{handle}/status/{tweet_id}"
                if tweet_id
                else f"https://x.com/{handle}",
                "created_at": "",
                "source": "syndication",
            }
        )
    return {"display_name": handle, "avatar": None, "posts": posts}


def fetch_channel(handle: str, cfg: NewsConfig) -> dict | None:
    """
    Récupère les derniers posts d'un compte.

    Retourne un dict `{display_name, avatar, posts}` ou `None` si toutes les
    sources ont échoué.
    """
    headers = {"User-Agent": cfg.user_agent}
    with httpx.Client(
        timeout=cfg.http_timeout, headers=headers, follow_redirects=True
    ) as client:
        result = _fetch_via_nitter(handle, cfg, client)
        if result is not None:
            return result
        return _fetch_via_syndication(handle, cfg, client)
