import { Lesson } from "../types";

/**
 * Leçon : Qu'est-ce qu'une blockchain ?
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const whatIsBlockchain: Lesson = {
  id: "what-is-blockchain",
  categoryId: "blockchain-basics",
  title: "Qu'est-ce qu'une blockchain ?",
  summary:
    "Le registre partagé qui sert de socle à la crypto, expliqué simplement.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Une blockchain est un grand registre numérique partagé. Il enregistre des transactions de façon ordonnée, et chaque participant du réseau en détient une copie identique.",
    },
    {
      type: "heading",
      text: "Une chaîne de blocs",
    },
    {
      type: "paragraph",
      text: "Les transactions sont regroupées dans des « blocs ». Chaque nouveau bloc fait référence au précédent, formant une chaîne. C'est cette structure qui donne son nom à la technologie.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Une fois inscrit et confirmé, un bloc est extrêmement difficile à modifier : il faudrait réécrire tous les blocs suivants sur la majorité des copies du réseau.",
    },
    {
      type: "heading",
      text: "Pourquoi c'est utile ?",
    },
    {
      type: "list",
      items: [
        "Transparence : tout le monde peut consulter l'historique.",
        "Décentralisation : aucune autorité unique ne contrôle le registre.",
        "Intégrité : l'historique est très difficile à falsifier.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text: "Bitcoin (2009) fut la première blockchain à grande échelle. Beaucoup d'autres ont suivi, avec des objectifs différents.",
    },
  ],
};
