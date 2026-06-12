import { Category } from "./types";

/**
 * Catégories de l'espace Éducation.
 *
 * `icon` correspond à un nom d'icône Feather (@expo/vector-icons).
 * `accentColor` réutilise les couleurs du design system (cf. global.css).
 */
export const CATEGORIES: Category[] = [
  {
    id: "blockchain-basics",
    title: "Bases blockchain",
    description: "Les fondations : blockchain, tokens, transactions.",
    icon: "box",
    accentColor: "#6283FA", // secondary
  },
  {
    id: "wallets-security",
    title: "Wallets & sécurité",
    description: "Comprendre et sécuriser son portefeuille crypto.",
    icon: "shield",
    accentColor: "#58FAAE", // validation
  },
  {
    id: "trading-concepts",
    title: "Comprendre le trading",
    description: "Le vocabulaire et les mécanismes, sans aucun conseil.",
    icon: "trending-up",
    accentColor: "#FF6A00", // novalidation
  },
  {
    id: "defi-nft",
    title: "DeFi & NFT",
    description: "Finance décentralisée, NFT et écosystème autour.",
    icon: "layers",
    accentColor: "#A78BFA", // violet d'accent
  },
];

/** Retourne une catégorie par son identifiant. */
export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
