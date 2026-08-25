import { Lesson } from "../types";

/**
 * Leçon : les intérêts composés.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const compoundInterest: Lesson = {
  id: "compound-interest",
  categoryId: "investing-basics",
  title: "Les intérêts composés",
  summary:
    "L'effet du temps sur un rendement — dans les deux sens.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Les intérêts composés désignent le fait que les gains d'une période génèrent eux-mêmes des gains à la période suivante. La croissance n'est plus linéaire mais exponentielle.",
    },
    {
      type: "heading",
      text: "L'effet en chiffres",
    },
    {
      type: "list",
      items: [
        "1 000 € à 7 % par an, sans réinvestissement : 1 700 € au bout de 10 ans.",
        "Les mêmes 1 000 € à 7 % avec réinvestissement : environ 1 967 € au bout de 10 ans.",
        "Sur 30 ans, l'écart devient 3 100 € contre environ 7 612 €.",
      ],
    },
    {
      type: "paragraph",
      text: "L'écart est faible au début et s'accélère avec le temps. C'est pourquoi la durée compte souvent davantage que le taux dans le résultat final.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Une approximation utile : diviser 72 par le taux annuel donne le nombre d'années nécessaires pour doubler un capital. À 6 %, il faut environ 12 ans.",
    },
    {
      type: "heading",
      text: "Le mécanisme fonctionne aussi à l'envers",
    },
    {
      type: "paragraph",
      text: "Des frais annuels s'appliquent chaque année sur un capital lui aussi composé. Un prélèvement de 2 % par an ampute d'environ 45 % le résultat sur trente ans, à rendement identique. Le même raisonnement vaut pour les pertes successives.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "La composition suppose une régularité que les marchés volatils n'offrent pas. Une série de fortes variations produit un résultat inférieur à celui d'un rendement moyen équivalent mais stable — c'est l'écart entre moyenne arithmétique et moyenne géométrique.",
    },
  ],
};
