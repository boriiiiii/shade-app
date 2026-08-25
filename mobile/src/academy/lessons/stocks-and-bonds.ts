import { Lesson } from "../types";

/**
 * Leçon : actions et obligations.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const stocksAndBonds: Lesson = {
  id: "stocks-and-bonds",
  categoryId: "etf-markets",
  title: "Actions et obligations",
  summary:
    "Les deux briques de base des marchés traditionnels.",
  level: "debutant",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Une entreprise qui a besoin d'argent a deux moyens principaux d'en lever : vendre une part d'elle-même, ou emprunter. Ces deux mécanismes donnent naissance aux actions et aux obligations.",
    },
    {
      type: "heading",
      text: "L'action : une part de propriété",
    },
    {
      type: "paragraph",
      text: "Détenir une action, c'est posséder une fraction de l'entreprise. On a droit à une part des bénéfices, éventuellement distribués sous forme de dividendes, et généralement à un droit de vote en assemblée générale.",
    },
    {
      type: "paragraph",
      text: "Le rendement n'est pas garanti : il dépend des résultats de l'entreprise. En cas de faillite, les actionnaires sont remboursés en dernier, souvent sans rien récupérer.",
    },
    {
      type: "heading",
      text: "L'obligation : une créance",
    },
    {
      type: "paragraph",
      text: "Détenir une obligation, c'est avoir prêté de l'argent à une entreprise ou à un État. L'émetteur s'engage à verser des intérêts à échéances fixes puis à rembourser le capital à la fin.",
    },
    {
      type: "paragraph",
      text: "Le rendement est connu à l'avance, sauf défaut de l'émetteur. En cas de faillite, les créanciers passent avant les actionnaires.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Action et obligation ne représentent pas deux degrés d'un même risque, mais deux positions juridiques différentes : propriétaire d'un côté, créancier de l'autre.",
    },
    {
      type: "heading",
      text: "Le prix d'une obligation bouge aussi",
    },
    {
      type: "paragraph",
      text: "Une obligation se revend avant son échéance, à un prix qui varie en sens inverse des taux d'intérêt. Quand les taux montent, les obligations déjà émises, moins rémunératrices, perdent de la valeur.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Un token de crypto n'entre dans aucune de ces deux catégories : il ne confère ni part de propriété ni créance. C'est une différence de nature, pas de degré.",
    },
  ],
};
