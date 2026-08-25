import { Lesson } from "../types";

/**
 * Leçon : le dimensionnement des positions.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const positionSizing: Lesson = {
  id: "position-sizing",
  categoryId: "risk-psychology",
  title: "Dimensionner une position",
  summary:
    "Pourquoi la taille engagée compte plus que le choix de l'actif.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Beaucoup d'attention se porte sur le choix de l'actif, très peu sur le montant engagé. C'est pourtant ce second paramètre qui détermine ce qu'une erreur coûte réellement.",
    },
    {
      type: "heading",
      text: "L'arithmétique de la ruine",
    },
    {
      type: "paragraph",
      text: "Engager la totalité d'un capital sur une position qui perd tout met fin à la partie : il ne reste rien pour la suite, quelle que soit la qualité des décisions ultérieures. Engager 2 % laisse 98 % du capital intact et permet d'encaisser une longue série d'erreurs.",
    },
    {
      type: "list",
      items: [
        "Perdre 10 % demande de regagner 11 % pour revenir au point de départ.",
        "Perdre 50 % en demande 100 %.",
        "Perdre 90 % en demande 900 %.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "Survivre à une série de pertes est une condition préalable à tout le reste. Une stratégie profitable en moyenne peut ruiner celui qui l'applique si la taille de ses positions est mal calibrée.",
    },
    {
      type: "heading",
      text: "Le levier",
    },
    {
      type: "paragraph",
      text: "Le levier permet d'engager plus que le capital détenu. Il multiplie les gains comme les pertes, et introduit un seuil de liquidation : en deçà d'un certain prix, la position est fermée d'office et la mise est perdue. Avec un levier de 10, une variation de 10 % en sens défavorable suffit.",
    },
    {
      type: "heading",
      text: "Le cas du copy trading",
    },
    {
      type: "paragraph",
      text: "Copier un trader avec un montant fixe par opération signifie que le nombre d'opérations qu'il déclenche détermine l'exposition totale. Un trader très actif peut engager plusieurs fois le montant prévu en une seule journée.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Le montant par trade et l'exposition totale sont deux choses distinctes. Le second se calcule ; il ne se devine pas à partir du premier.",
    },
  ],
};
