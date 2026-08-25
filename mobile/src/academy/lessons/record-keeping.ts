import { Lesson } from "../types";

/**
 * Leçon : tenir ses registres d'opérations.
 * Contenu purement pédagogique — aucun conseil fiscal ni financier.
 */
export const recordKeeping: Lesson = {
  id: "record-keeping",
  categoryId: "taxes-regulation",
  title: "Tenir ses registres",
  summary:
    "Ce qu'il faut conserver, et pourquoi le faire au fil de l'eau.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Reconstituer a posteriori un historique d'opérations réparties sur plusieurs plateformes et plusieurs wallets est long et source d'erreurs. Tenir un registre au fil de l'eau évite ce travail.",
    },
    {
      type: "heading",
      text: "Ce qu'il est utile de conserver",
    },
    {
      type: "list",
      items: [
        "La date et l'heure de chaque opération.",
        "La nature de l'opération : achat, vente, échange, transfert, frais.",
        "Les montants dans les deux actifs concernés.",
        "La contre-valeur en euros au moment de l'opération.",
        "Les frais payés, de réseau comme de plateforme.",
        "La signature de transaction ou la référence de l'ordre.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "La contre-valeur en euros au moment de l'opération est la donnée la plus difficile à retrouver après coup, et souvent la plus nécessaire.",
    },
    {
      type: "heading",
      text: "Le cas des opérations automatisées",
    },
    {
      type: "paragraph",
      text: "Un moteur de copy trading ou de sniping peut générer des dizaines d'opérations par jour. Le volume rend la reconstitution manuelle impraticable : l'export régulier devient une nécessité pratique, pas un raffinement.",
    },
    {
      type: "heading",
      text: "Les sources disponibles",
    },
    {
      type: "list",
      items: [
        "L'historique exportable des plateformes centralisées.",
        "Les explorateurs de blocs, qui donnent l'historique complet d'une adresse publique.",
        "Les outils d'agrégation qui rapprochent plusieurs wallets et plateformes.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text: "Un historique de plateforme peut devenir inaccessible si le service ferme ou suspend un compte. Exporter régulièrement, plutôt que de compter sur une consultation ultérieure, est la seule sauvegarde fiable.",
    },
  ],
};
