import { Lesson } from "../types";

/**
 * Leçon : carnet d'ordres et liquidité.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const orderBookAndLiquidity: Lesson = {
  id: "order-book-and-liquidity",
  categoryId: "trading-concepts",
  title: "Carnet d'ordres et liquidité",
  summary:
    "Comment un prix se forme, et pourquoi il ne veut pas dire grand-chose seul.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Le prix affiché pour un actif est simplement celui de la dernière transaction conclue. Pour savoir à quel prix on pourrait réellement acheter ou vendre, il faut regarder ce qu'il y a derrière : le carnet d'ordres.",
    },
    {
      type: "heading",
      text: "Le carnet d'ordres",
    },
    {
      type: "paragraph",
      text: "Un carnet d'ordres liste, d'un côté, tous les acheteurs avec le prix maximum qu'ils acceptent, et de l'autre tous les vendeurs avec leur prix minimum. Une transaction se produit quand les deux se rencontrent.",
    },
    {
      type: "list",
      items: [
        "Le « bid » : la meilleure offre d'achat du moment.",
        "L'« ask » : la meilleure offre de vente du moment.",
        "Le « spread » : l'écart entre les deux, en pourcentage du prix.",
      ],
    },
    {
      type: "heading",
      text: "La liquidité",
    },
    {
      type: "paragraph",
      text: "La liquidité mesure la capacité d'un marché à absorber un ordre sans que le prix bouge beaucoup. Un actif liquide affiche un spread étroit et beaucoup de volume à chaque niveau de prix.",
    },
    {
      type: "paragraph",
      text: "Sur un actif peu liquide, un ordre modeste consomme les premiers niveaux du carnet et va se servir plus loin, à des prix nettement moins favorables. C'est l'impact sur le prix.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Un prix affiché n'engage personne. Ce qui compte, c'est le prix moyen effectivement obtenu sur la taille de l'ordre que l'on souhaite passer.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Les tokens récents ont souvent très peu de liquidité. Un graphique peut y afficher une forte hausse alors que quelques centaines d'euros suffiraient à faire s'effondrer le prix à la revente.",
    },
  ],
};
