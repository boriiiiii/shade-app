import { Lesson } from "../types";

/**
 * Leçon : les ETF crypto au comptant.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const spotCryptoEtf: Lesson = {
  id: "spot-crypto-etf",
  categoryId: "etf-markets",
  title: "Les ETF crypto au comptant",
  summary:
    "Le point de rencontre entre la finance traditionnelle et la crypto.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Un ETF crypto au comptant — « spot » en anglais — est un fonds coté qui détient réellement la cryptomonnaie qu'il suit. Sa part se négocie sur un marché boursier classique, via un compte-titres ordinaire.",
    },
    {
      type: "heading",
      text: "Ce que ça change",
    },
    {
      type: "paragraph",
      text: "L'exposition au prix passe par un intermédiaire régulé, sans wallet à gérer ni clé privée à protéger. La conservation des actifs est déléguée à un dépositaire professionnel.",
    },
    {
      type: "list",
      items: [
        "Pas de phrase de récupération à sauvegarder.",
        "Pas de risque d'erreur d'adresse ou de signature malveillante.",
        "Un cadre fiscal et réglementaire identique à celui des autres titres cotés.",
      ],
    },
    {
      type: "heading",
      text: "Ce que ça enlève",
    },
    {
      type: "paragraph",
      text: "En contrepartie, on ne détient pas la crypto elle-même. Il devient impossible de l'utiliser en DeFi, de la staker, de la transférer, ou d'échanger en dehors des heures d'ouverture du marché.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Le compromis se résume à une phrase : on échange le contrôle direct contre la simplicité et la protection d'un cadre régulé.",
    },
    {
      type: "heading",
      text: "Différence avec un ETF à terme",
    },
    {
      type: "paragraph",
      text: "Un ETF à terme (« futures ») ne détient pas la crypto mais des contrats à échéance, qu'il doit renouveler régulièrement. Ce renouvellement engendre un coût récurrent qui peut faire dériver la performance par rapport au prix réel de l'actif.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Le format ne réduit en rien la volatilité de l'actif sous-jacent. Un ETF Bitcoin suit le Bitcoin, à la hausse comme à la baisse, et s'y ajoutent les frais de gestion du fonds.",
    },
  ],
};
