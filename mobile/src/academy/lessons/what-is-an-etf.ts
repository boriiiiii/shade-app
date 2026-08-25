import { Lesson } from "../types";

/**
 * Leçon : qu'est-ce qu'un ETF ?
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const whatIsAnEtf: Lesson = {
  id: "what-is-an-etf",
  categoryId: "etf-markets",
  title: "Qu'est-ce qu'un ETF ?",
  summary:
    "Un fonds coté en bourse qui réplique un indice, expliqué simplement.",
  level: "debutant",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "ETF signifie « Exchange Traded Fund », en français fonds indiciel coté. C'est un fonds d'investissement dont les parts s'achètent et se vendent en bourse, comme une action ordinaire.",
    },
    {
      type: "heading",
      text: "Le principe",
    },
    {
      type: "paragraph",
      text: "Un ETF détient un panier d'actifs — souvent plusieurs centaines de titres — et cherche à répliquer la performance d'un indice de référence. Acheter une part revient à détenir une fraction de l'ensemble du panier.",
    },
    {
      type: "paragraph",
      text: "Un ETF qui suit le S&P 500 détient ainsi les actions des cinq cents entreprises composant cet indice, dans les mêmes proportions.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Un ETF ne cherche pas à battre son indice, seulement à le suivre. C'est ce qu'on appelle la gestion passive, par opposition à la gestion active où un gérant choisit les titres.",
    },
    {
      type: "heading",
      text: "Pourquoi ce format existe",
    },
    {
      type: "list",
      items: [
        "Diversification immédiate : une seule part expose à des centaines d'entreprises.",
        "Frais réduits : sans gérant à rémunérer, les frais annuels sont souvent inférieurs à 0,3 %.",
        "Liquidité : les parts s'échangent en continu pendant les heures d'ouverture du marché.",
        "Transparence : la composition du panier est publiée régulièrement.",
      ],
    },
    {
      type: "heading",
      text: "Réplication physique ou synthétique",
    },
    {
      type: "paragraph",
      text: "Un ETF à réplication physique achète réellement les titres de l'indice. Un ETF synthétique passe par un contrat d'échange avec une banque, qui s'engage à verser la performance de l'indice. Le second introduit une dépendance à la solidité de cette contrepartie.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Un ETF ne supprime pas le risque de marché. Si l'indice suivi baisse de 30 %, l'ETF baisse d'autant. La diversification protège d'une faillite isolée, pas d'un recul général.",
    },
  ],
};
