import { Lesson } from "../types";

/**
 * Leçon : les frais de réseau.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const gasAndFees: Lesson = {
  id: "gas-and-fees",
  categoryId: "blockchain-basics",
  title: "Les frais de réseau",
  summary:
    "Pourquoi chaque transaction a un coût, et ce qui le fait varier.",
  level: "debutant",
  readingMinutes: 3,
  blocks: [
    {
      type: "paragraph",
      text: "Envoyer une transaction consomme des ressources : il faut que des machines la vérifient, l'exécutent et la stockent durablement. Les frais de réseau rémunèrent ce travail et évitent que le réseau soit saturé de transactions inutiles.",
    },
    {
      type: "heading",
      text: "Le « gas »",
    },
    {
      type: "paragraph",
      text: "Sur Ethereum et les réseaux qui s'en inspirent, on parle de gas : une unité qui mesure la quantité de calcul demandée. Un simple envoi coûte peu de gas ; une interaction avec un contrat complexe en coûte beaucoup plus.",
    },
    {
      type: "paragraph",
      text: "Le montant réellement payé est le produit du gas consommé par le prix du gas au moment de l'envoi. Ce prix monte quand beaucoup de monde veut passer en même temps.",
    },
    {
      type: "heading",
      text: "Le cas de Solana",
    },
    {
      type: "paragraph",
      text: "Solana fonctionne différemment : les frais de base sont fixes et très faibles (de l'ordre de quelques milliers de lamports, soit une fraction infime de SOL). En période de congestion, on peut y ajouter des « frais de priorité » pour que sa transaction soit traitée plus tôt.",
    },
    {
      type: "callout",
      variant: "info",
      text: "Un lamport vaut un milliardième de SOL. C'est l'unité dans laquelle les montants sont exprimés au niveau du protocole.",
    },
    {
      type: "heading",
      text: "Les frais ne sont pas les seuls coûts",
    },
    {
      type: "list",
      items: [
        "Frais de réseau : payés à la blockchain pour traiter la transaction.",
        "Frais de plateforme : prélevés par l'application ou l'agrégateur utilisé.",
        "Slippage : écart entre le prix attendu et le prix réellement obtenu.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text: "Une transaction qui échoue peut malgré tout consommer des frais : le réseau a déjà travaillé pour l'exécuter avant de constater l'erreur.",
    },
  ],
};
