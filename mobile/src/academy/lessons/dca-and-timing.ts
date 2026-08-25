import { Lesson } from "../types";

/**
 * Leçon : investissement programmé et question du timing.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const dcaAndTiming: Lesson = {
  id: "dca-and-timing",
  categoryId: "investing-basics",
  title: "Investissement programmé et timing",
  summary:
    "Ce que le DCA fait réellement, et pourquoi le timing est si difficile.",
  level: "debutant",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Le DCA — « dollar cost averaging », ou investissement programmé — consiste à placer un montant fixe à intervalles réguliers, sans tenir compte du prix du moment.",
    },
    {
      type: "heading",
      text: "L'effet mécanique",
    },
    {
      type: "paragraph",
      text: "À montant constant, on achète mécaniquement plus d'unités quand le prix est bas et moins quand il est haut. Le prix de revient moyen s'en trouve lissé par rapport à un achat unique effectué au hasard dans la période.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Le DCA ne fait pas gagner d'argent. Il réduit la dispersion des résultats possibles : moins de chances de tomber au pire moment, moins de chances de tomber au meilleur.",
    },
    {
      type: "heading",
      text: "Pourquoi le timing est difficile",
    },
    {
      type: "paragraph",
      text: "Sur longue période, une part importante de la performance d'un marché se concentre sur un très petit nombre de séances. Manquer ces séances change radicalement le résultat — et elles surviennent le plus souvent au milieu de périodes de forte baisse, c'est-à-dire quand la tentation de sortir est maximale.",
    },
    {
      type: "paragraph",
      text: "Le problème n'est pas d'acheter au bon moment, mais de devoir avoir raison deux fois : à la sortie et au retour.",
    },
    {
      type: "heading",
      text: "Ce que le DCA ne règle pas",
    },
    {
      type: "list",
      items: [
        "Il ne protège pas d'un actif qui baisse durablement sans jamais se redresser.",
        "Il multiplie le nombre de transactions, donc les frais associés.",
        "Il suppose une régularité qui exige de la discipline précisément quand le marché baisse.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text: "Appliquer un investissement programmé à un actif sans liquidité ou dont le projet disparaît revient à moyenner une perte, pas à la lisser.",
    },
  ],
};
