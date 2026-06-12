import { Lesson } from "../types";

/**
 * Leçon : Copy trading et sniping, c'est quoi ?
 * Contenu purement descriptif et pédagogique — aucun conseil financier,
 * aucune incitation à pratiquer ces stratégies.
 */
export const copyTradingAndSniping: Lesson = {
  id: "copy-trading-and-sniping",
  categoryId: "trading-concepts",
  title: "Copy trading et sniping : c'est quoi ?",
  summary:
    "Définir ces deux pratiques de façon neutre, ainsi que leurs risques.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Le copy trading et le sniping sont deux pratiques répandues dans la crypto. Cette leçon les décrit pour les comprendre — elle ne recommande ni n'encourage de les pratiquer.",
    },
    {
      type: "heading",
      text: "Le copy trading",
    },
    {
      type: "paragraph",
      text: "Le copy trading consiste à reproduire automatiquement les opérations d'un autre trader. Quand la personne suivie réalise une transaction, une opération similaire est exécutée sur votre propre portefeuille.",
    },
    {
      type: "heading",
      text: "Le sniping",
    },
    {
      type: "paragraph",
      text: "Le sniping désigne l'achat très rapide d'un token dès sa mise en circulation, généralement via un programme automatisé, afin d'être parmi les premiers à se positionner.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Ces pratiques comportent des risques élevés : forte volatilité, tokens frauduleux, pertes potentiellement totales. Les performances passées d'un trader ne préjugent jamais des résultats futurs.",
    },
    {
      type: "callout",
      variant: "info",
      text: "L'objectif de cet espace est de vous aider à comprendre ces mécanismes, pas de vous inciter à les utiliser. Toute décision vous appartient et relève de votre seule responsabilité.",
    },
  ],
};
