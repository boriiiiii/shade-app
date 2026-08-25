import { Lesson } from "../types";

/**
 * Leçon : la diversification.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const diversification: Lesson = {
  id: "diversification",
  categoryId: "investing-basics",
  title: "La diversification",
  summary:
    "Répartir pour réduire un type de risque — et ce que cela ne règle pas.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Diversifier consiste à répartir un capital entre plusieurs actifs, de façon qu'un événement défavorable sur l'un n'emporte pas l'ensemble. C'est l'un des rares mécanismes en finance dont l'effet est mathématiquement démontrable.",
    },
    {
      type: "heading",
      text: "Deux risques, un seul réductible",
    },
    {
      type: "list",
      items: [
        "Le risque spécifique concerne un actif en particulier : une faillite, une faille dans un contrat, une équipe qui disparaît. La diversification le réduit fortement.",
        "Le risque de marché touche tout un ensemble en même temps : une crise, un changement réglementaire, un retournement général. La diversification à l'intérieur de cet ensemble ne le réduit pas.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "Détenir vingt tokens différents ne diversifie pas grand-chose s'ils montent et descendent tous ensemble. Ce qui compte n'est pas le nombre de lignes, mais leur degré d'indépendance.",
    },
    {
      type: "heading",
      text: "La corrélation",
    },
    {
      type: "paragraph",
      text: "La corrélation mesure la tendance de deux actifs à évoluer dans le même sens. Deux actifs faiblement corrélés apportent une vraie diversification ; deux actifs fortement corrélés n'en apportent presque aucune.",
    },
    {
      type: "paragraph",
      text: "Un fait souvent constaté : les corrélations augmentent pendant les crises. Des actifs qui semblaient indépendants en période calme peuvent chuter simultanément au moment où la diversification serait la plus utile.",
    },
    {
      type: "heading",
      text: "La concentration comme choix",
    },
    {
      type: "paragraph",
      text: "Concentrer amplifie les résultats dans les deux sens. Ce n'est pas une erreur en soi, mais c'est un choix qui doit être conscient : il augmente à la fois le gain possible et la probabilité de perte importante.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Copier un seul trader revient à concentrer sur une seule stratégie et une seule personne. C'est une forme de concentration, même si le portefeuille copié contient plusieurs actifs.",
    },
  ],
};
