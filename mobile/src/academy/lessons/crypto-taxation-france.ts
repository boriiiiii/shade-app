import { Lesson } from "../types";

/**
 * Leçon : la fiscalité des cryptoactifs en France.
 * Contenu purement pédagogique — aucun conseil fiscal ni financier.
 */
export const cryptoTaxationFrance: Lesson = {
  id: "crypto-taxation-france",
  categoryId: "taxes-regulation",
  title: "La fiscalité crypto en France",
  summary:
    "Les principes généraux applicables aux particuliers.",
  level: "intermediaire",
  readingMinutes: 6,
  blocks: [
    {
      type: "callout",
      variant: "warning",
      text: "Ce contenu présente des principes généraux à titre informatif. Il ne constitue pas un conseil fiscal. Les règles évoluent et dépendent de votre situation : référez-vous au site de l'administration fiscale ou à un professionnel.",
    },
    {
      type: "paragraph",
      text: "En France, les gains réalisés par un particulier sur des actifs numériques relèvent d'un régime spécifique, distinct de celui des valeurs mobilières classiques.",
    },
    {
      type: "heading",
      text: "Le fait générateur",
    },
    {
      type: "paragraph",
      text: "L'imposition se déclenche à la cession d'un actif numérique contre une monnaie ayant cours légal — l'euro par exemple — ou lors d'un achat de bien ou de service payé en crypto.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Un échange de crypto contre crypto n'est en principe pas un fait générateur : convertir du SOL en USDC ne déclenche pas l'imposition. C'est la sortie vers la monnaie ayant cours légal qui compte.",
    },
    {
      type: "heading",
      text: "Le régime applicable",
    },
    {
      type: "paragraph",
      text: "Les plus-values des particuliers relèvent du prélèvement forfaitaire unique, souvent appelé « flat tax », à 30 % — soit 12,8 % d'impôt sur le revenu et 17,2 % de prélèvements sociaux. Une option pour le barème progressif est possible et peut être plus favorable selon la situation.",
    },
    {
      type: "paragraph",
      text: "Le calcul se fait sur l'ensemble du portefeuille et non ligne par ligne : la plus-value imposable tient compte du prix total d'acquisition rapporté à la valeur globale du portefeuille au moment de la cession.",
    },
    {
      type: "heading",
      text: "Les obligations déclaratives",
    },
    {
      type: "list",
      items: [
        "Déclarer les plus-values de cession réalisées sur l'année.",
        "Déclarer les comptes d'actifs numériques ouverts, détenus ou clos à l'étranger — une obligation distincte de celle sur les plus-values.",
        "Conserver le détail des opérations permettant de justifier les montants déclarés.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text: "Une activité d'achat-revente très fréquente peut être requalifiée en activité professionnelle, avec un régime fiscal différent. Le sniping et le copy trading automatisé génèrent par nature un volume d'opérations élevé.",
    },
  ],
};
