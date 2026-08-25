import { Lesson } from "../types";

/**
 * Leçon : Clé privée vs clé publique
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const privateVsPublicKey: Lesson = {
  id: "private-vs-public-key",
  categoryId: "wallets-security",
  title: "Clé privée vs clé publique",
  summary:
    "La paire de clés qui contrôle un wallet, et pourquoi l'une ne se partage jamais.",
  level: "debutant",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Un wallet crypto repose sur une paire de clés cryptographiques : une clé publique et une clé privée. Comprendre leur rôle est la base de la sécurité.",
    },
    {
      type: "heading",
      text: "La clé publique",
    },
    {
      type: "paragraph",
      text: "La clé publique (et l'adresse qui en dérive) est ce que vous partagez pour recevoir des fonds. On peut la comparer à un numéro de compte : la connaître ne permet à personne de dépenser à votre place.",
    },
    {
      type: "heading",
      text: "La clé privée",
    },
    {
      type: "paragraph",
      text: "La clé privée sert à signer les transactions : elle prouve que vous êtes le propriétaire des fonds. Quiconque la détient contrôle totalement le wallet.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Ne partagez jamais votre clé privée ni votre phrase de récupération (seed phrase). Aucun service légitime ne vous la demandera.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Règle à retenir : clé publique = pour recevoir, on peut la partager. Clé privée = pour dépenser, elle reste secrète.",
    },
  ],
};
