import { Lesson } from "../types";

/**
 * Leçon : sauvegarde et récupération d'un wallet auto-géré.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const selfCustodyBasics: Lesson = {
  id: "self-custody-basics",
  categoryId: "wallets-security",
  title: "Sauvegarder et récupérer un wallet",
  summary:
    "Ce qui se passe quand on perd son téléphone — et comment s'y préparer.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Un wallet auto-géré n'a pas de bouton « mot de passe oublié ». Il n'existe aucun tiers capable de rétablir l'accès. La sauvegarde n'est donc pas une précaution optionnelle : c'est la seule voie de récupération.",
    },
    {
      type: "heading",
      text: "Ce qu'un wallet contient réellement",
    },
    {
      type: "paragraph",
      text: "Un wallet ne « contient » pas de crypto. Les actifs sont inscrits sur la blockchain ; le wallet détient seulement la clé qui permet de les déplacer. Perdre l'appareil ne détruit rien — perdre la clé rend les actifs définitivement inaccessibles.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Restaurer sa phrase de récupération dans un nouveau wallet redonne accès aux mêmes fonds, sur n'importe quel appareil. C'est aussi ce qui rend cette phrase si sensible.",
    },
    {
      type: "heading",
      text: "Une sauvegarde qui tient dans le temps",
    },
    {
      type: "list",
      items: [
        "Support durable et hors ligne : papier de qualité, ou plaque métallique pour résister au feu et à l'eau.",
        "Au moins deux copies, dans deux lieux physiques distincts.",
        "Aucune trace numérique : ni photo, ni cloud, ni gestionnaire de mots de passe synchronisé, ni message à soi-même.",
        "Un test de restauration une fois la sauvegarde faite, pour vérifier qu'elle est correcte et lisible.",
      ],
    },
    {
      type: "heading",
      text: "Prévoir l'imprévu",
    },
    {
      type: "paragraph",
      text: "Une sauvegarde que personne ne peut retrouver en cas d'accident revient à une perte totale. À l'inverse, une sauvegarde trop accessible expose au vol. Trouver l'équilibre entre les deux fait partie de la mise en place.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Écrire la phrase sur un support numérique, même temporairement, suffit à la compromettre. Un presse-papiers, un brouillon d'e-mail ou une capture d'écran sont autant de fuites possibles.",
    },
  ],
};
