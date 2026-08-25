import { Lesson } from "../types";

/**
 * Leçon : slippage et impact sur le prix.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const slippageAndPriceImpact: Lesson = {
  id: "slippage-and-price-impact",
  categoryId: "trading-concepts",
  title: "Slippage et impact sur le prix",
  summary:
    "Pourquoi le prix obtenu diffère du prix annoncé, et ce que règle le slippage.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Entre le moment où une interface affiche un prix et celui où la transaction est inscrite sur la blockchain, il s'écoule quelques secondes. Le marché a pu bouger. Le slippage est le paramètre qui définit jusqu'où on accepte que le prix se dégrade.",
    },
    {
      type: "heading",
      text: "Deux notions différentes",
    },
    {
      type: "list",
      items: [
        "L'impact sur le prix est prévisible : il découle de la taille de l'ordre par rapport à la liquidité disponible, et il est calculé à l'avance.",
        "Le slippage est une tolérance : il couvre ce qui bouge entre l'estimation et l'exécution.",
      ],
    },
    {
      type: "heading",
      text: "Comment le réglage se comporte",
    },
    {
      type: "paragraph",
      text: "Une tolérance faible protège du mauvais prix, mais fait échouer la transaction dès que le marché bouge un peu — et les frais de réseau peuvent être consommés malgré l'échec. Une tolérance élevée fait passer presque toutes les transactions, au prix d'une exécution potentiellement bien pire que prévu.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Le slippage s'exprime souvent en points de base (bps) : 1 % vaut 100 bps, 3 % valent 300 bps. Vérifiez toujours l'unité attendue par l'interface avant de saisir une valeur.",
    },
    {
      type: "heading",
      text: "Le sandwich",
    },
    {
      type: "paragraph",
      text: "Sur une blockchain publique, une transaction en attente est visible de tous. Un acteur automatisé peut placer son propre ordre juste avant puis juste après, en encaissant la différence. Plus la tolérance au slippage est large, plus l'espace laissé à cette pratique est grand.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Une tolérance très élevée sur un token peu liquide peut se traduire par une exécution à un prix sans rapport avec celui affiché à l'écran.",
    },
  ],
};
