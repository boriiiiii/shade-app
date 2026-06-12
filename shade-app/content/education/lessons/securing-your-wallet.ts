import { Lesson } from "../types";

/**
 * Leçon : Bien sécuriser son wallet
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const securingYourWallet: Lesson = {
  id: "securing-your-wallet",
  categoryId: "wallets-security",
  title: "Bien sécuriser son wallet",
  summary:
    "Les bonnes pratiques de base pour protéger l'accès à ses actifs.",
  level: "intermediaire",
  readingMinutes: 6,
  blocks: [
    {
      type: "paragraph",
      text: "En crypto, c'est souvent l'utilisateur lui-même qui est responsable de la garde de ses clés. Adopter quelques réflexes réduit fortement les risques.",
    },
    {
      type: "heading",
      text: "La phrase de récupération",
    },
    {
      type: "paragraph",
      text: "À la création d'un wallet, une phrase de récupération (souvent 12 ou 24 mots) est générée. Elle permet de restaurer l'accès à vos fonds. C'est l'élément le plus sensible à protéger.",
    },
    {
      type: "list",
      items: [
        "Notez-la hors ligne (papier), à l'abri du feu et de l'eau.",
        "Ne la prenez jamais en photo et ne la stockez pas dans le cloud.",
        "Ne la saisissez que dans votre wallet officiel, jamais sur un site web.",
      ],
    },
    {
      type: "heading",
      text: "Reconnaître les pièges courants",
    },
    {
      type: "list",
      items: [
        "Phishing : faux sites ou faux supports qui imitent un service connu.",
        "Faux support : personne qui vous contacte en se faisant passer pour l'assistance.",
        "Approbations de contrats : vérifier ce qu'une transaction autorise réellement.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text: "Un « cold wallet » (matériel, hors ligne) stocke les clés en dehors d'internet. Un « hot wallet » est connecté : plus pratique au quotidien, mais plus exposé.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Principe directeur : « Not your keys, not your coins ». Si vous ne détenez pas les clés, vous dépendez d'un tiers pour vos actifs.",
    },
  ],
};
