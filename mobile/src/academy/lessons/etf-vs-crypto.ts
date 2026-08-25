import { Lesson } from "../types";

/**
 * Leçon : comparaison ETF / crypto.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const etfVsCrypto: Lesson = {
  id: "etf-vs-crypto",
  categoryId: "etf-markets",
  title: "ETF et crypto : quelles différences ?",
  summary:
    "Deux univers, deux cadres, deux façons de détenir un actif.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Comparer un ETF et un token revient à comparer deux enveloppes très différentes. Les distinguer sur quelques axes concrets évite de raisonner sur l'un avec les réflexes de l'autre.",
    },
    {
      type: "heading",
      text: "La détention",
    },
    {
      type: "paragraph",
      text: "Une part d'ETF est inscrite chez un intermédiaire financier, qui en tient le registre. Un token est inscrit sur une blockchain publique, et c'est la clé privée qui en donne le contrôle. Dans le premier cas on fait confiance à une institution, dans le second à sa propre rigueur.",
    },
    {
      type: "heading",
      text: "Les horaires",
    },
    {
      type: "paragraph",
      text: "Un ETF ne s'échange que pendant les heures d'ouverture du marché, du lundi au vendredi. Une crypto s'échange en continu, y compris la nuit et le week-end — ce qui signifie aussi qu'un mouvement brutal peut survenir à tout moment.",
    },
    {
      type: "heading",
      text: "La protection",
    },
    {
      type: "list",
      items: [
        "ETF : agrément d'une autorité de marché, document d'information réglementaire obligatoire, dépositaire distinct de la société de gestion.",
        "Token : aucun agrément requis pour émettre, aucune information imposée, aucun recours en cas de disparition du projet.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "Une erreur sur un ETF se conteste auprès d'un intermédiaire. Une transaction blockchain confirmée est définitive : il n'existe aucune procédure d'annulation.",
    },
    {
      type: "heading",
      text: "La nature de la valeur",
    },
    {
      type: "paragraph",
      text: "Un ETF actions représente des entreprises qui produisent des biens et dégagent des bénéfices. Un token tire sa valeur de l'usage de son protocole, de sa rareté programmée ou, très souvent, de la seule demande du marché.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Ni l'un ni l'autre n'est « meilleur ». Ce sont des instruments de nature différente, à évaluer avec des critères différents.",
    },
  ],
};
