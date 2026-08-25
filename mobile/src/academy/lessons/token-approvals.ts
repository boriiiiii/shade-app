import { Lesson } from "../types";

/**
 * Leçon : les autorisations de dépense accordées aux contrats.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const tokenApprovals: Lesson = {
  id: "token-approvals",
  categoryId: "wallets-security",
  title: "Les autorisations de dépense",
  summary:
    "Ce qu'une signature autorise réellement, et comment la révoquer.",
  level: "avance",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Pour échanger un token sur une application décentralisée, il faut d'abord l'autoriser à manipuler ce token pour vous. Cette autorisation est une transaction à part entière, souvent expédiée en un clic — et rarement relue.",
    },
    {
      type: "heading",
      text: "Ce qui est réellement signé",
    },
    {
      type: "paragraph",
      text: "Une autorisation précise trois choses : quel contrat est autorisé, sur quel token, et jusqu'à quel montant. Beaucoup d'interfaces proposent par défaut un montant illimité, pour éviter de redemander l'autorisation à chaque opération.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Une autorisation illimitée reste valable après l'opération. Si le contrat autorisé est compromis plus tard, il conserve le droit de déplacer ce token depuis votre wallet.",
    },
    {
      type: "heading",
      text: "Le cas de Solana",
    },
    {
      type: "paragraph",
      text: "Solana utilise un mécanisme voisin appelé délégation : un compte de token peut désigner un délégué autorisé à en transférer une quantité donnée. Le principe et le risque sont les mêmes que pour une autorisation Ethereum.",
    },
    {
      type: "heading",
      text: "Réflexes utiles",
    },
    {
      type: "list",
      items: [
        "Lire l'écran de signature du wallet plutôt que celui du site : seul le premier reflète ce qui sera exécuté.",
        "Préférer un montant limité quand l'interface le permet.",
        "Passer en revue périodiquement les autorisations actives et révoquer celles qui ne servent plus.",
        "Séparer les usages : un wallet pour l'expérimentation, un autre pour ce qu'on garde.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text: "Révoquer une autorisation est une transaction comme une autre : elle coûte des frais de réseau et doit être signée.",
    },
  ],
};
