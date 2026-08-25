import { Lesson } from "../types";

/**
 * Leçon : épargner, investir, spéculer.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const investingVsSpeculating: Lesson = {
  id: "investing-vs-speculating",
  categoryId: "investing-basics",
  title: "Épargner, investir, spéculer",
  summary:
    "Trois démarches souvent confondues, aux horizons et aux risques différents.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Ces trois mots désignent des démarches distinctes. Les confondre conduit à évaluer une décision avec les mauvais critères.",
    },
    {
      type: "heading",
      text: "Épargner",
    },
    {
      type: "paragraph",
      text: "Mettre de l'argent de côté en cherchant à en préserver la disponibilité et le montant. Le rendement est faible et le capital est peu ou pas exposé. L'objectif est la sécurité et l'accès immédiat, pas la performance.",
    },
    {
      type: "heading",
      text: "Investir",
    },
    {
      type: "paragraph",
      text: "Placer un capital dans un actif dont on attend qu'il produise de la valeur dans la durée : une entreprise qui dégage des bénéfices, une obligation qui verse un intérêt, un bien qui génère un loyer. L'horizon se compte en années, et le raisonnement porte sur ce que l'actif produit.",
    },
    {
      type: "heading",
      text: "Spéculer",
    },
    {
      type: "paragraph",
      text: "Chercher un gain sur la variation de prix d'un actif, indépendamment de ce qu'il produit. L'horizon peut être de quelques minutes. Le raisonnement porte sur l'anticipation du comportement des autres participants, pas sur une production de valeur.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Le copy trading et le sniping relèvent de la troisième catégorie. Les évaluer avec les critères de la deuxième — « combien cet actif produit-il ? » — n'a pas de sens, et inversement.",
    },
    {
      type: "heading",
      text: "Un critère simple pour se situer",
    },
    {
      type: "list",
      items: [
        "Sur quel horizon la décision est-elle prise : jours, mois, années ?",
        "D'où viendrait le gain : d'une production de valeur, ou d'un prix payé par quelqu'un d'autre ?",
        "Quelle part du capital serait-il acceptable de perdre entièrement ?",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text: "Aucune de ces démarches n'est supérieure aux autres. Elles répondent à des besoins différents et comportent des risques de nature différente.",
    },
  ],
};
