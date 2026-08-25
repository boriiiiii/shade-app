import { Lesson } from "../types";

/**
 * Leçon : la perte impermanente.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const impermanentLoss: Lesson = {
  id: "impermanent-loss",
  categoryId: "defi-nft",
  title: "La perte impermanente",
  summary:
    "Le coût caché de la fourniture de liquidité, expliqué avec un exemple.",
  level: "avance",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Quand un fournisseur dépose deux actifs dans un pool, il accepte implicitement que leur répartition évolue au gré des échanges. La perte impermanente mesure l'écart entre ce qu'il récupère et ce qu'il aurait eu en gardant simplement les deux actifs dans son wallet.",
    },
    {
      type: "heading",
      text: "D'où vient l'écart",
    },
    {
      type: "paragraph",
      text: "L'AMM rééquilibre en permanence le pool. Si un actif monte, les arbitragistes en retirent du pool jusqu'à ce que le prix interne rejoigne le prix du marché. Le fournisseur se retrouve donc avec moins de l'actif qui a monté, et plus de celui qui a baissé.",
    },
    {
      type: "heading",
      text: "Un exemple chiffré",
    },
    {
      type: "list",
      items: [
        "Dépôt initial : 1 SOL à 100 € et 100 USDC, soit 200 € au total.",
        "Le SOL passe à 400 €. Après rééquilibrage, le pool restitue environ 0,5 SOL et 200 USDC.",
        "Valeur retirée : environ 400 €.",
        "Valeur si les actifs étaient restés dans le wallet : 400 € + 100 € = 500 €.",
        "Écart : environ 100 €, soit 20 % de moins — hors commissions perçues.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "L'écart existe dans les deux sens : la perte apparaît dès que le rapport de prix entre les deux actifs change, à la hausse comme à la baisse.",
    },
    {
      type: "heading",
      text: "Pourquoi « impermanente » ?",
    },
    {
      type: "paragraph",
      text: "Le terme vient du fait que l'écart se résorbe si le rapport de prix revient à son point de départ. En pratique, il se matérialise dès le retrait — le mot « impermanente » est donc trompeur.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Les commissions perçues peuvent compenser cet écart, en partie ou en totalité. C'est le volume échangé qui décide, et il n'est pas connu à l'avance.",
    },
  ],
};
