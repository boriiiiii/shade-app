import { Lesson } from "../types";

/**
 * Leçon : teneurs de marché automatisés et pools de liquidité.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const ammAndLiquidityPools: Lesson = {
  id: "amm-and-liquidity-pools",
  categoryId: "defi-nft",
  title: "AMM et pools de liquidité",
  summary:
    "Comment un échange décentralisé fixe un prix sans carnet d'ordres.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Un échange décentralisé n'a pas de carnet d'ordres à tenir. Il utilise à la place un teneur de marché automatisé — AMM en anglais — c'est-à-dire une formule mathématique qui calcule le prix à partir du contenu d'une réserve.",
    },
    {
      type: "heading",
      text: "Le pool de liquidité",
    },
    {
      type: "paragraph",
      text: "Un pool est un contrat qui détient deux actifs, par exemple SOL et USDC. Des fournisseurs de liquidité y déposent les deux dans des proportions données et reçoivent en échange des parts représentant leur quote-part du pool.",
    },
    {
      type: "heading",
      text: "La formule du produit constant",
    },
    {
      type: "paragraph",
      text: "Le modèle le plus répandu maintient constant le produit des deux réserves. Acheter le premier actif le retire du pool et y ajoute le second : le premier devient mécaniquement plus rare, donc plus cher. Le prix se déplace à chaque transaction, sans qu'aucun acteur ne le fixe.",
    },
    {
      type: "callout",
      variant: "key",
      text: "C'est cette mécanique qui produit l'impact sur le prix : plus l'ordre est gros par rapport à la taille du pool, plus il déplace le prix à son détriment.",
    },
    {
      type: "heading",
      text: "La rémunération des fournisseurs",
    },
    {
      type: "paragraph",
      text: "Chaque échange prélève une commission, souvent quelques dixièmes de pour cent, qui reste dans le pool. Elle revient aux fournisseurs de liquidité au prorata de leurs parts. Cette rémunération n'est pas un rendement garanti : elle dépend entièrement du volume échangé.",
    },
    {
      type: "heading",
      text: "Les agrégateurs",
    },
    {
      type: "paragraph",
      text: "Un même token peut exister dans plusieurs pools, sur plusieurs plateformes. Un agrégateur comme Jupiter, utilisé par Shade, compare ces routes et découpe éventuellement l'ordre pour obtenir un meilleur prix moyen.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Fournir de la liquidité expose à la perte impermanente et au risque de défaillance du contrat. Ce n'est pas équivalent à un dépôt d'épargne.",
    },
  ],
};
