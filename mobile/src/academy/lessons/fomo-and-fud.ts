import { Lesson } from "../types";

/**
 * Leçon : FOMO, FUD et biais émotionnels.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const fomoAndFud: Lesson = {
  id: "fomo-and-fud",
  categoryId: "risk-psychology",
  title: "FOMO, FUD et biais",
  summary:
    "Les mécanismes psychologiques qui pèsent le plus sur les décisions.",
  level: "debutant",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Les décisions financières se prennent rarement dans le calme. Deux états émotionnels reviennent si souvent qu'ils ont leur acronyme, et plusieurs biais cognitifs documentés s'y ajoutent.",
    },
    {
      type: "heading",
      text: "FOMO",
    },
    {
      type: "paragraph",
      text: "« Fear Of Missing Out » : la peur de rater une occasion. Elle se déclenche en voyant un prix monter fortement ou d'autres afficher leurs gains. Elle pousse à acheter après la hausse, c'est-à-dire au moment où le risque est le plus élevé.",
    },
    {
      type: "heading",
      text: "FUD",
    },
    {
      type: "paragraph",
      text: "« Fear, Uncertainty and Doubt » : la peur, l'incertitude et le doute. Symétrique de la FOMO, elle pousse à vendre dans la panique. Le terme est aussi employé pour disqualifier toute critique, ce qui en fait un outil de manipulation autant qu'une description.",
    },
    {
      type: "heading",
      text: "Les biais qui s'y ajoutent",
    },
    {
      type: "list",
      items: [
        "Aversion à la perte : une perte est ressentie environ deux fois plus fort qu'un gain équivalent.",
        "Biais de confirmation : on retient les informations qui confortent une décision déjà prise.",
        "Ancrage : le prix d'achat sert de référence, alors que le marché l'ignore totalement.",
        "Coût irrécupérable : on garde une position perdante parce qu'on y a déjà engagé de l'argent.",
        "Excès de confiance : quelques réussites sont attribuées à une compétence plutôt qu'au hasard.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "Connaître ces biais ne suffit pas à s'en prémunir : ils opèrent en dessous du niveau conscient. Ce qui aide, c'est de décider à froid, avant que la situation ne se présente.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "L'automatisation ne supprime pas ces biais, elle les déplace : le choix du trader à copier, le moment d'activer ou de couper le moteur restent des décisions humaines, prises à chaud.",
    },
  ],
};
