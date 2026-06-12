/**
 * Client API pour la section News (agrégation de comptes Twitter/X).
 */

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

/** Un post normalisé, indépendant de la plateforme source. */
export interface NewsPost {
  id: string;
  handle: string;
  author: string;
  avatar: string | null;
  text: string;
  media: string[];
  url: string;
  created_at: string;
  source: string;
}

/** Un canal suivi (compte). */
export interface Channel {
  handle: string;
  display_name: string | null;
  avatar: string | null;
  active: boolean;
}

export interface NewsFeed {
  posts: NewsPost[];
  from_cache: boolean;
}

/** Récupère le feed agrégé de tous les canaux actifs. */
export async function getNewsFeed(): Promise<NewsFeed> {
  const response = await fetch(`${API_URL}/news`);
  if (!response.ok) throw new Error(`Erreur News: ${response.status}`);
  return response.json();
}

/** Liste les canaux suivis. */
export async function getChannels(): Promise<Channel[]> {
  const response = await fetch(`${API_URL}/news/channels`);
  if (!response.ok) throw new Error(`Erreur canaux: ${response.status}`);
  return response.json();
}

/** Ajoute un canal par son @handle. */
export async function addChannel(handle: string): Promise<Channel> {
  const response = await fetch(`${API_URL}/news/channels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle }),
  });
  if (!response.ok) throw new Error(`Ajout impossible: ${response.status}`);
  return response.json();
}

/** Retire un canal. */
export async function removeChannel(handle: string): Promise<void> {
  const response = await fetch(`${API_URL}/news/channels/${handle}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Suppression impossible: ${response.status}`);
}
