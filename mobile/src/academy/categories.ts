import { Category } from "./types";

/**
 * Catégories de l'Academy.
 *
 * `icon` correspond à un nom d'icône Feather (@expo/vector-icons).
 * `accentColor` réutilise les couleurs du design system (cf. global.css)
 * quand elles existent, et des teintes voisines pour les catégories
 * supplémentaires.
 *
 * L'ordre du tableau est l'ordre d'affichage : du plus fondamental au plus
 * spécialisé.
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
  {
    id: "investing-basics",
    title: "Bases de l'investissement",
    description: "Rendement, risque, durée : le socle commun à tous les actifs.",
    icon: "target",
    accentColor: "#F2C55C", // doré
  },
  {
    id: "etf-markets",
    title: "ETF & marchés",
    description: "Actions, obligations, indices et fonds indiciels cotés.",
    icon: "bar-chart-2",
    accentColor: "#4ECDC4", // turquoise
  },
  {
    id: "risk-psychology",
    title: "Risque & psychologie",
    description: "Volatilité, biais cognitifs et limites du copy trading.",
    icon: "alert-triangle",
    accentColor: "#FA7272", // invalidation
  },
  {
    id: "taxes-regulation",
    title: "Fiscalité & réglementation",
    description: "Le cadre français et européen, expliqué en termes simples.",
    icon: "file-text",
    accentColor: "#9AA7BC", // gris-bleu
  },
];

/** Retourne une catégorie par son identifiant. */
export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
