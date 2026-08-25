import { Lesson } from "../types";

/**
 * Leçon : Layer 1 et Layer 2.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const layer1Layer2: Lesson = {
  id: "layer-1-layer-2",
  categoryId: "blockchain-basics",
  title: "Layer 1, Layer 2 : de quoi parle-t-on ?",
  summary:
    "Les couches d'une blockchain, et pourquoi certaines s'empilent.",
  level: "intermediaire",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Une blockchain doit arbitrer entre trois qualités : la sécurité, la décentralisation et le débit de transactions. Améliorer l'une se fait souvent au détriment des autres — c'est ce qu'on appelle le trilemme de la scalabilité.",
    },
    {
      type: "heading",
      text: "Layer 1 : la couche de base",
    },
    {
      type: "paragraph",
      text: "Un Layer 1 est une blockchain autonome, avec son propre consensus et sa propre sécurité. Bitcoin, Ethereum et Solana en sont. Chacune fait un choix différent : Bitcoin privilégie la robustesse, Solana le débit, Ethereum l'écosystème d'applications.",
    },
    {
      type: "heading",
      text: "Layer 2 : une couche par-dessus",
    },
    {
      type: "paragraph",
      text: "Un Layer 2 traite les transactions en dehors de la chaîne principale, puis y publie régulièrement un résumé compressé. Les utilisateurs paient moins cher, tout en s'appuyant sur la sécurité du Layer 1 sous-jacent.",
    },
    {
      type: "paragraph",
      text: "Arbitrum, Optimism et Base sont des Layer 2 d'Ethereum. Le Lightning Network joue un rôle comparable pour Bitcoin.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Un Layer 2 hérite de la sécurité de sa chaîne de base, mais ajoute ses propres hypothèses : un pont, un séquenceur, un délai de retrait. Ce sont autant de points à comprendre avant de l'utiliser.",
    },
    {
      type: "heading",
      text: "Et Solana dans tout ça ?",
    },
    {
      type: "paragraph",
      text: "Solana a fait le pari inverse : monter le débit directement sur la couche de base plutôt que d'empiler des couches. C'est pour cette raison qu'on y trouve peu de Layer 2, et que les frais y sont faibles nativement.",
    },
  ],
};
