import { Lesson } from "../types";

/**
 * Leçon : le couple risque / rendement.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const riskAndReturn: Lesson = {
  id: "risk-and-return",
  categoryId: "investing-basics",
  title: "Risque et rendement",
  summary:
    "Pourquoi un rendement élevé n'est jamais gratuit, et comment se lit un risque.",
  level: "debutant",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Sur des marchés où de nombreux acteurs cherchent le meilleur rapport possible, un actif qui offrirait un rendement élevé sans risque associé serait immédiatement acheté jusqu'à ce que son rendement redescende. C'est pourquoi les deux sont liés.",
    },
    {
      type: "heading",
      text: "Ce que « risque » veut dire",
    },
    {
      type: "paragraph",
      text: "Le mot recouvre plusieurs réalités qu'il vaut mieux nommer séparément :",
    },
    {
      type: "list",
      items: [
        "Volatilité : l'amplitude des variations de prix à court terme.",
        "Perte en capital : la possibilité de ne pas retrouver la somme engagée.",
        "Perte totale : le cas où l'actif ne vaut plus rien du tout.",
        "Illiquidité : l'impossibilité de vendre au moment voulu, à un prix raisonnable.",
        "Risque de contrepartie : la défaillance de l'entité qui détient les fonds.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "Ces risques ne se compensent pas entre eux. Un actif peu volatil peut être totalement illiquide ; un actif très liquide peut perdre toute sa valeur.",
    },
    {
      type: "heading",
      text: "L'asymétrie des pertes",
    },
    {
      type: "paragraph",
      text: "Une perte de 50 % demande un gain de 100 % pour revenir au point de départ. Une perte de 80 % en demande 400 %. Plus la perte est profonde, plus le chemin du retour est disproportionné — c'est une propriété arithmétique, pas une opinion.",
    },
    {
      type: "heading",
      text: "Lire une performance passée",
    },
    {
      type: "paragraph",
      text: "Un rendement annoncé ne dit rien du risque pris pour l'obtenir. Deux stratégies affichant la même performance peuvent avoir traversé des parcours radicalement différents : l'une régulière, l'autre passée par une perte de 70 % en cours de route.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Les performances passées ne préjugent pas des performances futures. Cette phrase est une obligation réglementaire parce qu'elle décrit un fait statistique établi.",
    },
  ],
};
