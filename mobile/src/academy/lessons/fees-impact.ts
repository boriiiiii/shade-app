import { Lesson } from "../types";

/**
 * Leçon : l'impact cumulé des frais.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const feesImpact: Lesson = {
  id: "fees-impact",
  categoryId: "investing-basics",
  title: "L'impact des frais",
  summary:
    "Le seul paramètre connu à l'avance — et souvent le plus sous-estimé.",
  level: "intermediaire",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Le rendement d'un actif est incertain. Les frais, eux, sont connus d'avance et se produisent avec certitude. C'est la seule variable d'une décision financière sur laquelle on garde un contrôle direct.",
    },
    {
      type: "heading",
      text: "Les couches de frais",
    },
    {
      type: "list",
      items: [
        "Frais d'entrée ou de sortie : prélevés à chaque mouvement.",
        "Frais de gestion annuels : prélevés en continu sur l'encours.",
        "Frais de transaction : commission de la plateforme sur chaque opération.",
        "Frais de réseau : payés à la blockchain, indépendants du montant.",
        "Écart de prix : spread et slippage, qui sont un coût réel même sans ligne dédiée.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "L'écart entre le prix d'achat et le prix de vente instantané est un coût, même quand aucune commission n'apparaît. C'est souvent le plus lourd sur les actifs peu liquides.",
    },
    {
      type: "heading",
      text: "L'effet de la fréquence",
    },
    {
      type: "paragraph",
      text: "Un coût de 0,5 % par opération semble négligeable. Répété deux fois par jour sur un an, il représente plusieurs fois le capital de départ en volume traité. Une stratégie à haute fréquence doit dégager une performance brute très supérieure pour rester positive une fois les frais déduits.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Le copy trading et le sniping multiplient mécaniquement le nombre d'opérations. Chaque trade copié porte l'intégralité des frais : réseau, plateforme, slippage.",
    },
    {
      type: "heading",
      text: "Sur de petits montants",
    },
    {
      type: "paragraph",
      text: "Les frais de réseau sont fixes et non proportionnels. Sur une opération de quelques euros, ils peuvent représenter une part très significative du montant engagé.",
    },
  ],
};
