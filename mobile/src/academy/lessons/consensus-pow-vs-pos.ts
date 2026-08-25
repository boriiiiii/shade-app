import { Lesson } from "../types";

/**
 * Leçon : Preuve de travail et preuve d'enjeu.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const consensusPowVsPos: Lesson = {
  id: "consensus-pow-vs-pos",
  categoryId: "blockchain-basics",
  title: "Preuve de travail et preuve d'enjeu",
  summary:
    "Comment un réseau sans chef se met d'accord sur ce qui est vrai.",
  level: "intermediaire",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Une blockchain n'a pas d'autorité centrale pour trancher. Il lui faut donc une règle qui permette à des milliers de participants qui ne se connaissent pas de s'accorder sur le contenu du prochain bloc. C'est ce qu'on appelle un mécanisme de consensus.",
    },
    {
      type: "heading",
      text: "La preuve de travail (Proof of Work)",
    },
    {
      type: "paragraph",
      text: "Les participants, appelés mineurs, font tourner des machines qui cherchent la solution d'un calcul volontairement coûteux. Le premier à la trouver propose le bloc suivant. Trouver la solution demande beaucoup d'électricité ; vérifier qu'elle est correcte est instantané.",
    },
    {
      type: "paragraph",
      text: "C'est le mécanisme utilisé par Bitcoin depuis 2009. Sa sécurité repose sur un coût réel : réécrire l'histoire supposerait de refaire tout ce travail plus vite que le reste du réseau réuni.",
    },
    {
      type: "heading",
      text: "La preuve d'enjeu (Proof of Stake)",
    },
    {
      type: "paragraph",
      text: "Ici, ce ne sont pas des machines qui sont mises en jeu mais des tokens. Des validateurs immobilisent une quantité de crypto en garantie ; le protocole en désigne un pour produire le bloc. Un validateur malhonnête peut voir sa garantie amputée — c'est le « slashing ».",
    },
    {
      type: "paragraph",
      text: "Ethereum est passé à ce modèle en 2022. Solana, la blockchain utilisée par Shade, fonctionne également en preuve d'enjeu.",
    },
    {
      type: "list",
      items: [
        "Preuve de travail : sécurité adossée à une dépense d'énergie, débit faible.",
        "Preuve d'enjeu : sécurité adossée à un capital immobilisé, consommation très réduite.",
        "Les deux visent le même objectif : rendre la triche plus coûteuse que l'honnêteté.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text: "Aucun des deux mécanismes n'est « meilleur » dans l'absolu : ils font des compromis différents entre décentralisation, sécurité et débit de transactions.",
    },
  ],
};
