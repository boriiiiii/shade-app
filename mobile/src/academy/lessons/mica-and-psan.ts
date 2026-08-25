import { Lesson } from "../types";

/**
 * Leçon : le cadre réglementaire européen et français.
 * Contenu purement pédagogique — aucun conseil juridique ni financier.
 */
export const micaAndPsan: Lesson = {
  id: "mica-and-psan",
  categoryId: "taxes-regulation",
  title: "MiCA et enregistrement PSAN",
  summary:
    "Le cadre réglementaire qui encadre les prestataires crypto.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Longtemps, les activités liées aux cryptoactifs se sont développées sans cadre dédié. L'Union européenne et la France ont depuis mis en place des régimes d'agrément pour les prestataires.",
    },
    {
      type: "heading",
      text: "Le statut PSAN",
    },
    {
      type: "paragraph",
      text: "En France, un prestataire de services sur actifs numériques doit s'enregistrer auprès de l'Autorité des marchés financiers. L'enregistrement porte notamment sur l'honorabilité des dirigeants et sur les dispositifs de lutte contre le blanchiment.",
    },
    {
      type: "callout",
      variant: "info",
      text: "L'enregistrement contrôle la conformité du prestataire. Il ne constitue en aucun cas une garantie sur la valeur des actifs proposés ni sur la performance d'un service.",
    },
    {
      type: "heading",
      text: "Le règlement MiCA",
    },
    {
      type: "paragraph",
      text: "« Markets in Crypto-Assets » est un règlement européen qui harmonise les règles applicables aux émetteurs de cryptoactifs et aux prestataires de services, dans l'ensemble des États membres.",
    },
    {
      type: "list",
      items: [
        "Un agrément unique valable dans toute l'Union européenne.",
        "Des obligations d'information pour les émetteurs de jetons.",
        "Des exigences renforcées sur les stablecoins, notamment sur leurs réserves.",
        "Des règles de conservation et de séparation des actifs des clients.",
      ],
    },
    {
      type: "heading",
      text: "Ce que la réglementation ne couvre pas",
    },
    {
      type: "paragraph",
      text: "Les protocoles décentralisés sans entité identifiable, les échanges directs entre particuliers et les tokens émis de façon anonyme restent largement hors de ce périmètre. C'est précisément l'environnement dans lequel opèrent le sniping et une bonne partie du copy trading.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Utiliser un service enregistré ne réduit pas le risque de marché. Aucun agrément ne protège d'une baisse de prix ni d'une décision d'investissement malheureuse.",
    },
  ],
};
