import { Lesson } from "../types";

/**
 * Leçon : Comprendre les NFT
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const understandingNfts: Lesson = {
  id: "understanding-nfts",
  categoryId: "defi-nft",
  title: "Comprendre les NFT",
  summary:
    "Ce qu'est un jeton non fongible, ses usages réels et ses limites.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "NFT signifie « Non-Fungible Token », soit jeton non fongible. « Non fongible » veut dire unique et non interchangeable : contrairement à une monnaie où chaque unité se vaut, chaque NFT est distinct.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Fongible vs non fongible : 1 euro = 1 euro (fongible). Une œuvre signée ≠ une autre œuvre (non fongible). Le NFT applique cette unicité à un objet numérique.",
    },
    {
      type: "heading",
      text: "À quoi ça sert",
    },
    {
      type: "list",
      items: [
        "Représenter la propriété d'un objet numérique (image, musique, vidéo).",
        "Donner un accès (billet d'événement, abonnement, communauté).",
        "Certifier l'authenticité ou l'origine d'un bien.",
        "Représenter un objet dans un jeu vidéo.",
      ],
    },
    {
      type: "heading",
      text: "Idées reçues",
    },
    {
      type: "paragraph",
      text: "Posséder un NFT ne signifie pas toujours détenir les droits d'auteur de l'œuvre associée : cela dépend de ce que prévoit le projet. Par ailleurs, le fichier lui-même est souvent stocké en dehors de la blockchain.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "La valeur d'un NFT dépend entièrement de ce que le marché lui attribue : elle peut être très volatile, voire nulle. Ce contenu décrit le concept, il n'encourage aucun achat.",
    },
  ],
};
