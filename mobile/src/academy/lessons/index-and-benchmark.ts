import { Lesson } from "../types";

/**
 * Leçon : indices et indices de référence.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const indexAndBenchmark: Lesson = {
  id: "index-and-benchmark",
  categoryId: "etf-markets",
  title: "Indices et indices de référence",
  summary:
    "Ce que mesure un indice, et pourquoi tout se compare à lui.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Un indice est un panier de titres construit selon des règles publiques, dont on calcule la valeur en continu. Il sert de thermomètre pour un marché entier, et de point de comparaison pour juger une performance.",
    },
    {
      type: "heading",
      text: "Quelques indices connus",
    },
    {
      type: "list",
      items: [
        "CAC 40 : les 40 plus grandes capitalisations de la bourse de Paris.",
        "S&P 500 : les 500 principales entreprises cotées aux États-Unis.",
        "MSCI World : environ 1 500 grandes entreprises de 23 pays développés.",
        "Nasdaq 100 : les 100 plus grandes valeurs non financières du Nasdaq.",
      ],
    },
    {
      type: "heading",
      text: "La pondération change tout",
    },
    {
      type: "paragraph",
      text: "La plupart des indices pondèrent leurs composants par capitalisation : plus une entreprise pèse lourd, plus elle influence l'indice. Une poignée de très grandes valeurs peut ainsi représenter une part considérable du total.",
    },
    {
      type: "callout",
      variant: "info",
      text: "C'est pourquoi un indice « large » peut être moins diversifié qu'il n'y paraît : son sort dépend souvent de quelques entreprises dominantes.",
    },
    {
      type: "heading",
      text: "L'indice de référence",
    },
    {
      type: "paragraph",
      text: "Comparer une performance à un indice de référence permet de savoir si un résultat vient d'une compétence particulière ou simplement du mouvement général du marché. Un gain de 15 % sur une année où l'indice a progressé de 25 % reste un retard.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Le même raisonnement s'applique au copy trading : une performance annoncée n'a de sens que rapportée à ce qu'aurait donné le simple fait de ne rien faire sur la même période.",
    },
  ],
};
