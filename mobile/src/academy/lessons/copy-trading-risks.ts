import { Lesson } from "../types";

/**
 * Leçon : les risques propres au copy trading.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const copyTradingRisks: Lesson = {
  id: "copy-trading-risks",
  categoryId: "risk-psychology",
  title: "Les risques propres au copy trading",
  summary:
    "Ce que copier automatiquement ajoute comme risques.",
  level: "avance",
  readingMinutes: 6,
  blocks: [
    {
      type: "paragraph",
      text: "Copier un trader ne se limite pas à reproduire ses gains éventuels. Le mécanisme lui-même introduit des risques qui n'existent pas quand on décide seul.",
    },
    {
      type: "heading",
      text: "Le décalage d'exécution",
    },
    {
      type: "paragraph",
      text: "La copie intervient nécessairement après la transaction d'origine : il faut la détecter, construire la transaction, la faire signer, puis la diffuser. Sur un actif peu liquide, le prix a déjà bougé — souvent dans le sens défavorable, puisque l'achat initial l'a lui-même poussé à la hausse.",
    },
    {
      type: "heading",
      text: "La sortie n'est pas copiée de la même façon",
    },
    {
      type: "paragraph",
      text: "Un trader suivi peut vendre à un moment où la copie ne se déclenche pas, ou se déclenche trop tard. Entrer en copie sans disposer du même mécanisme de sortie revient à ne reproduire que la moitié de la stratégie.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Une stratégie ne se juge pas sur ses entrées mais sur le couple entrée-sortie. Copier l'une sans l'autre ne reproduit pas la performance observée.",
    },
    {
      type: "heading",
      text: "Les autres décalages",
    },
    {
      type: "list",
      items: [
        "Taille : un montant fixe ne représente pas la même part de capital chez le suiveur et chez le suivi.",
        "Frais : chaque copie porte l'intégralité des frais de réseau et du slippage, qui pèsent d'autant plus que le montant est petit.",
        "Effet de meute : si beaucoup copient le même wallet, leurs achats simultanés dégradent le prix pour tout le monde.",
        "Intention : rien ne distingue un achat spéculatif d'un rééquilibrage ou d'un simple transfert.",
      ],
    },
    {
      type: "heading",
      text: "Le risque de comportement",
    },
    {
      type: "paragraph",
      text: "Le wallet suivi peut changer de stratégie sans prévenir, être compromis, ou déclencher volontairement des achats pour faire monter un token qu'il détient déjà en réserve. Rien, sur une blockchain publique, ne permet de distinguer ces cas au moment où la transaction apparaît.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Une adresse publique est anonyme et son historique peut être fabriqué : il est possible de faire tourner plusieurs wallets et de ne rendre visible que celui qui a réussi. C'est le biais du survivant, appliqué délibérément.",
    },
  ],
};
