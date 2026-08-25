import { Lesson } from "../types";

/**
 * Leçon : reconnaître les arnaques crypto les plus fréquentes.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const commonScams: Lesson = {
  id: "common-scams",
  categoryId: "wallets-security",
  title: "Reconnaître les arnaques courantes",
  summary:
    "Rug pull, honeypot, drainer, faux airdrop : les schémas qui reviennent.",
  level: "intermediaire",
  readingMinutes: 6,
  blocks: [
    {
      type: "paragraph",
      text: "La création d'un token ne coûte presque rien et ne demande aucune autorisation. Il en résulte un grand nombre de projets sans substance, dont certains sont conçus dès le départ pour capter des fonds. Connaître les schémas récurrents permet de les identifier plus vite.",
    },
    {
      type: "heading",
      text: "Le rug pull",
    },
    {
      type: "paragraph",
      text: "Les créateurs d'un token retirent brutalement la liquidité du pool d'échange, ou vendent la réserve qu'ils s'étaient attribuée. Le prix s'effondre et les détenteurs se retrouvent avec un actif qu'il n'est plus possible de revendre.",
    },
    {
      type: "heading",
      text: "Le honeypot",
    },
    {
      type: "paragraph",
      text: "Le contrat du token autorise l'achat mais bloque la vente pour tout le monde sauf ses auteurs. Le graphique paraît sain, les acheteurs affluent, mais aucune sortie n'est possible.",
    },
    {
      type: "heading",
      text: "Le drainer",
    },
    {
      type: "paragraph",
      text: "Un site imite une interface connue et demande une signature présentée comme anodine — vérification de wallet, réclamation d'un airdrop. La signature autorise en réalité le transfert des actifs vers l'adresse de l'attaquant.",
    },
    {
      type: "heading",
      text: "Le faux airdrop",
    },
    {
      type: "paragraph",
      text: "Des tokens inconnus apparaissent dans un wallet, accompagnés d'un lien vers un site de « réclamation ». Le token lui-même est sans valeur ; son rôle est d'amener la victime sur le site piégé.",
    },
    {
      type: "heading",
      text: "Les signaux qui reviennent",
    },
    {
      type: "list",
      items: [
        "Une urgence artificielle : offre limitée, compte à rebours, « dernières places ».",
        "Un rendement présenté comme garanti, ou sans risque.",
        "Une équipe anonyme et un code source indisponible.",
        "Une demande de phrase de récupération, quel qu'en soit le prétexte.",
        "Un contact non sollicité par message privé, y compris depuis un compte qui semble officiel.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "Aucun service légitime — wallet, plateforme, support technique — ne demandera jamais votre phrase de récupération. Cette règle n'a aucune exception.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Le copy trading n'immunise pas contre ces schémas : copier l'achat d'un token piégé reproduit exactement le même risque, à la même vitesse.",
    },
  ],
};
