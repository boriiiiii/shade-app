import { Lesson } from "../types";

/**
 * Leçon : les types d'ordres.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const orderTypes: Lesson = {
  id: "order-types",
  categoryId: "trading-concepts",
  title: "Les types d'ordres",
  summary:
    "Marché, limite, stop : ce que chaque instruction demande vraiment.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Passer un ordre revient à donner une instruction précise. La formulation choisie détermine ce qui est garanti : le prix, ou l'exécution — jamais les deux.",
    },
    {
      type: "heading",
      text: "L'ordre au marché",
    },
    {
      type: "paragraph",
      text: "« Exécute immédiatement, au meilleur prix disponible. » L'exécution est quasi certaine, le prix ne l'est pas. C'est le type d'ordre utilisé par la plupart des échanges sur les applications décentralisées.",
    },
    {
      type: "heading",
      text: "L'ordre à cours limité",
    },
    {
      type: "paragraph",
      text: "« N'exécute pas au-delà de ce prix. » Le prix est garanti, l'exécution ne l'est pas : si le marché n'atteint jamais le niveau demandé, l'ordre reste en attente indéfiniment.",
    },
    {
      type: "heading",
      text: "L'ordre stop",
    },
    {
      type: "paragraph",
      text: "« Déclenche un ordre quand le prix franchit ce seuil. » Il sert à automatiser une sortie sans surveiller en continu. Une fois déclenché, il devient un ordre au marché — et subit donc l'incertitude de prix correspondante.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Un ordre stop ne garantit pas le prix de sortie. Lors d'un mouvement brutal, le déclenchement peut se produire bien en dessous du seuil fixé.",
    },
    {
      type: "heading",
      text: "Et sur les applications décentralisées ?",
    },
    {
      type: "paragraph",
      text: "Les échanges automatisés fonctionnent nativement au marché. Les ordres limites et stop y sont reproduits par des services tiers qui surveillent le prix et déclenchent la transaction pour vous — ce qui ajoute une dépendance à ce service.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Le sniping et le copy trading reposent sur des ordres au marché : la priorité y est donnée à la vitesse d'exécution, pas au contrôle du prix.",
    },
  ],
};
