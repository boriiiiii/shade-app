import { Lesson } from "../types";

/**
 * Leçon : la volatilité.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const volatility: Lesson = {
  id: "volatility",
  categoryId: "risk-psychology",
  title: "La volatilité",
  summary:
    "Ce que mesure vraiment l'amplitude des variations de prix.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "La volatilité mesure l'amplitude des variations de prix d'un actif sur une période. Elle ne dit rien du sens du mouvement : un actif très volatil bouge beaucoup, vers le haut comme vers le bas.",
    },
    {
      type: "heading",
      text: "Des ordres de grandeur",
    },
    {
      type: "list",
      items: [
        "Un indice actions large varie généralement de quelques dixièmes de pour cent par jour.",
        "Une grande cryptomonnaie peut varier de plusieurs pour cent dans la même journée.",
        "Un token récent et peu liquide peut varier de plusieurs dizaines de pour cent en quelques heures.",
      ],
    },
    {
      type: "heading",
      text: "Pourquoi la crypto est plus volatile",
    },
    {
      type: "list",
      items: [
        "Un marché ouvert en continu, sans interruption ni mécanisme de suspension.",
        "Une liquidité souvent faible en dehors des principaux actifs.",
        "L'absence de valorisation de référence à laquelle rattacher un prix.",
        "Un recours fréquent à l'effet de levier, qui amplifie les mouvements par liquidations en chaîne.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "La volatilité n'est pas un défaut à corriger : c'est une caractéristique de l'actif. Le problème surgit quand on l'accepte sans l'avoir mesurée à l'avance.",
    },
    {
      type: "heading",
      text: "L'effet sur les décisions",
    },
    {
      type: "paragraph",
      text: "Une forte volatilité multiplie les occasions de réagir, donc les occasions de se tromper. Elle rend aussi très difficile de distinguer une variation ordinaire d'un signal réel — la plupart des mouvements quotidiens n'ont aucune signification particulière.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Le sniping opère précisément sur les actifs les plus volatils du marché, ceux dont le prix peut être divisé par plusieurs en quelques minutes.",
    },
  ],
};
