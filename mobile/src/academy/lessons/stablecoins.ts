import { Lesson } from "../types";

/**
 * Leçon : les stablecoins.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const stablecoins: Lesson = {
  id: "stablecoins",
  categoryId: "defi-nft",
  title: "Les stablecoins",
  summary:
    "Des tokens indexés sur une monnaie — et ce qui fait tenir l'indexation.",
  level: "debutant",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Un stablecoin est un token dont la valeur est censée suivre celle d'une monnaie, le plus souvent le dollar. Il sert d'unité de compte et de refuge temporaire à l'intérieur de l'écosystème crypto, sans repasser par un compte bancaire.",
    },
    {
      type: "heading",
      text: "Adossés à des réserves",
    },
    {
      type: "paragraph",
      text: "USDC et USDT fonctionnent sur ce modèle : un émetteur détient des dollars et des titres de court terme, et émet un token pour chaque dollar déposé. L'indexation tient tant que l'émetteur est solvable et honore les remboursements.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Ce modèle réintroduit un intermédiaire de confiance. L'émetteur peut, selon les juridictions, geler des tokens sur une adresse donnée.",
    },
    {
      type: "heading",
      text: "Adossés à de la crypto",
    },
    {
      type: "paragraph",
      text: "D'autres stablecoins sont garantis par des cryptos déposées en surcollatéral : il faut immobiliser plus de valeur qu'on n'émet, pour absorber la volatilité du collatéral. DAI relève de cette catégorie.",
    },
    {
      type: "heading",
      text: "Algorithmiques",
    },
    {
      type: "paragraph",
      text: "Certains modèles ont tenté de maintenir l'indexation par un seul jeu d'incitations, sans réserve suffisante. L'effondrement de TerraUSD en mai 2022, qui a effacé plusieurs dizaines de milliards de dollars en quelques jours, a montré la fragilité de cette approche.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "« Stable » qualifie un objectif, pas une garantie. Un stablecoin peut perdre son indexation, temporairement ou définitivement. USDC est lui-même descendu à 0,87 $ en mars 2023 lors de la faillite d'une banque détenant une partie de ses réserves.",
    },
    {
      type: "heading",
      text: "Le rôle dans le trading",
    },
    {
      type: "paragraph",
      text: "La plupart des paires d'échange sont libellées en stablecoin. C'est aussi souvent l'unité dans laquelle une performance est mesurée — ce qui suppose que l'indexation tienne pour que le chiffre ait un sens.",
    },
  ],
};
