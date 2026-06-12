import { Lesson } from "../types";

/**
 * Leçon : Qu'est-ce que la DeFi ?
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const whatIsDefi: Lesson = {
  id: "what-is-defi",
  categoryId: "defi-nft",
  title: "Qu'est-ce que la DeFi ?",
  summary:
    "La finance décentralisée : ses principes, ses usages et ses risques.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "La DeFi (« Decentralized Finance », finance décentralisée) désigne un ensemble de services financiers qui fonctionnent grâce à des smart contracts sur une blockchain, sans intermédiaire central comme une banque.",
    },
    {
      type: "heading",
      text: "Ce qu'on peut y faire",
    },
    {
      type: "list",
      items: [
        "Échanger des tokens via un DEX (plateforme décentralisée).",
        "Prêter ses actifs ou en emprunter.",
        "Fournir de la liquidité à un protocole.",
        "Faire du staking pour participer à la sécurité d'un réseau.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text: "« Sans intermédiaire » signifie que les règles sont inscrites dans le code du smart contract, qui s'exécute automatiquement. L'utilisateur garde le contrôle de ses fonds.",
    },
    {
      type: "heading",
      text: "Les risques à connaître",
    },
    {
      type: "list",
      items: [
        "Bugs ou failles dans les smart contracts.",
        "Forte volatilité des actifs concernés.",
        "Projets frauduleux (ex. rug pull).",
        "Aucune autorité pour récupérer des fonds en cas d'erreur.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text: "La DeFi offre beaucoup de liberté, mais transfère aussi toute la responsabilité à l'utilisateur. Comprendre un protocole avant d'interagir avec est essentiel.",
    },
  ],
};
