import { Lesson } from "../types";

/**
 * Leçon : Solana en bref.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const whatIsSolana: Lesson = {
  id: "what-is-solana",
  categoryId: "blockchain-basics",
  title: "Solana en bref",
  summary:
    "La blockchain sur laquelle repose Shade : ses choix techniques et ses limites.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Solana est une blockchain lancée en 2020, conçue autour d'un objectif précis : traiter un grand nombre de transactions par seconde avec des frais très faibles. C'est le réseau utilisé par les fonctions de copy trading et de sniping de Shade.",
    },
    {
      type: "heading",
      text: "Ce qui la distingue",
    },
    {
      type: "list",
      items: [
        "Un horodatage intégré au protocole (Proof of History) qui ordonne les transactions sans attendre un accord global à chaque étape.",
        "Un consensus en preuve d'enjeu, où les validateurs immobilisent du SOL en garantie.",
        "Des frais de base fixes et très faibles, indépendants de la complexité de l'opération.",
        "Des blocs produits environ toutes les 400 millisecondes.",
      ],
    },
    {
      type: "heading",
      text: "Le vocabulaire à connaître",
    },
    {
      type: "list",
      items: [
        "SOL : le token natif, utilisé pour payer les frais et pour le staking.",
        "Lamport : la plus petite unité de SOL (un milliardième).",
        "Mint : l'adresse qui identifie un token de façon unique sur le réseau.",
        "Compte associé (ATA) : le compte qui détient un token donné pour un wallet donné.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text: "Quand une application vous demande une « adresse de mint », elle attend l'identifiant du token, pas l'adresse d'un wallet.",
    },
    {
      type: "heading",
      text: "Les limites",
    },
    {
      type: "paragraph",
      text: "Le réseau a connu plusieurs interruptions entre 2021 et 2022, liées à des pics de charge. Sa faible barrière à l'entrée facilite aussi la création massive de tokens sans projet derrière, ce qui augmente l'exposition aux arnaques.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Des frais faibles et une exécution rapide ne rendent pas une opération moins risquée. Ils rendent seulement plus facile d'en enchaîner beaucoup.",
    },
  ],
};
