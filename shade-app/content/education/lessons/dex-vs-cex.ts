import { Lesson } from "../types";

/**
 * Leçon : DEX vs CEX
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const dexVsCex: Lesson = {
  id: "dex-vs-cex",
  categoryId: "trading-concepts",
  title: "DEX vs CEX : deux façons d'échanger",
  summary:
    "Comprendre la différence entre plateformes centralisées et décentralisées.",
  level: "intermediaire",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Pour échanger des cryptos, il existe deux grandes familles de plateformes : les plateformes centralisées (CEX) et décentralisées (DEX). Elles répondent à des logiques différentes.",
    },
    {
      type: "heading",
      text: "CEX — plateforme centralisée",
    },
    {
      type: "paragraph",
      text: "Un CEX (« Centralized Exchange ») est géré par une société. Il est simple d'usage, mais l'utilisateur confie généralement ses fonds à la plateforme, qui les conserve pour lui.",
    },
    {
      type: "heading",
      text: "DEX — plateforme décentralisée",
    },
    {
      type: "paragraph",
      text: "Un DEX (« Decentralized Exchange ») fonctionne via des smart contracts. L'utilisateur échange directement depuis son wallet et garde le contrôle de ses fonds à tout moment.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Repère essentiel : sur un CEX, la plateforme détient les clés ; sur un DEX, c'est toi. « Not your keys, not your coins ».",
    },
    {
      type: "callout",
      variant: "info",
      text: "Chaque approche a ses compromis (simplicité, autonomie, types de risques). Cette leçon les décrit sans recommander l'une ou l'autre.",
    },
  ],
};
