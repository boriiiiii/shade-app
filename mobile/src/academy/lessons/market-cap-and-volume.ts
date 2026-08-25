import { Lesson } from "../types";

/**
 * Leçon : capitalisation, offre en circulation et volume.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const marketCapAndVolume: Lesson = {
  id: "market-cap-and-volume",
  categoryId: "trading-concepts",
  title: "Capitalisation, offre et volume",
  summary:
    "Trois chiffres omniprésents, et ce qu'ils mesurent réellement.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Les interfaces de suivi affichent presque toujours les mêmes indicateurs. Les lire correctement évite un certain nombre de contresens.",
    },
    {
      type: "heading",
      text: "La capitalisation",
    },
    {
      type: "paragraph",
      text: "Elle se calcule en multipliant le prix par le nombre de tokens en circulation. C'est un ordre de grandeur, pas une somme d'argent réellement investie : il serait impossible de vendre l'intégralité de l'offre à ce prix.",
    },
    {
      type: "heading",
      text: "L'offre : trois chiffres à distinguer",
    },
    {
      type: "list",
      items: [
        "Offre en circulation : les tokens effectivement disponibles sur le marché.",
        "Offre totale : tous les tokens existants, y compris ceux qui sont bloqués.",
        "Offre maximale : le plafond prévu par le protocole, quand il en existe un.",
      ],
    },
    {
      type: "paragraph",
      text: "La capitalisation totalement diluée applique le prix actuel à l'offre maximale. L'écart entre elle et la capitalisation en circulation indique la quantité de tokens qui pourraient arriver sur le marché plus tard.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Un prix unitaire faible ne signifie pas qu'un token est « moins cher ». Un token à 0,001 € avec mille milliards d'unités pèse plus lourd qu'un token à 100 € avec un million d'unités.",
    },
    {
      type: "heading",
      text: "Le volume",
    },
    {
      type: "paragraph",
      text: "Le volume mesure le montant échangé sur une période, en général vingt-quatre heures. Rapporté à la capitalisation, il donne une idée de l'activité réelle autour d'un actif.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Le volume peut être artificiellement gonflé par des échanges entre comptes contrôlés par la même personne. Un volume élevé face à une liquidité inexistante est un signal de prudence, pas de santé.",
    },
  ],
};
