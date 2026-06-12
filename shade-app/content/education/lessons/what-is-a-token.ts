import { Lesson } from "../types";

/**
 * Leçon : Qu'est-ce qu'un token ?
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const whatIsAToken: Lesson = {
  id: "what-is-a-token",
  categoryId: "blockchain-basics",
  title: "Qu'est-ce qu'un token ?",
  summary:
    "Différencier une cryptomonnaie native d'un token, et à quoi ça sert.",
  level: "debutant",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Un token (ou « jeton ») est une unité de valeur ou de droit enregistrée sur une blockchain. Le terme est large : il peut représenter une monnaie, un accès, un droit de vote ou un objet numérique.",
    },
    {
      type: "heading",
      text: "Monnaie native vs token",
    },
    {
      type: "paragraph",
      text: "Chaque blockchain a une monnaie « native » qui sert à payer les frais de réseau : par exemple le SOL sur Solana, l'ETH sur Ethereum. Les autres actifs créés par-dessus cette blockchain sont appelés des tokens.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Sur Ethereum, la plupart des tokens suivent la norme « ERC-20 ». Sur Solana, on parle de tokens SPL. Ce sont des standards techniques qui garantissent la compatibilité avec les wallets.",
    },
    {
      type: "heading",
      text: "Différents usages",
    },
    {
      type: "list",
      items: [
        "Token utilitaire : donne accès à un service ou une fonctionnalité.",
        "Stablecoin : conçu pour suivre la valeur d'une monnaie classique (ex. dollar).",
        "Token de gouvernance : permet de voter sur les décisions d'un projet.",
        "NFT : un token unique, non interchangeable, souvent lié à un objet numérique.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text: "N'importe qui peut créer un token en quelques minutes. Le fait qu'un token existe ne dit rien de sa qualité ni de sa fiabilité — d'où l'importance de comprendre avant tout.",
    },
  ],
};
