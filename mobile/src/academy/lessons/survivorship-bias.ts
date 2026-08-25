import { Lesson } from "../types";

/**
 * Leçon : le biais du survivant.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const survivorshipBias: Lesson = {
  id: "survivorship-bias",
  categoryId: "risk-psychology",
  title: "Le biais du survivant",
  summary:
    "Pourquoi on ne voit jamais ceux qui ont échoué.",
  level: "intermediaire",
  readingMinutes: 4,
  blocks: [
    {
      type: "paragraph",
      text: "Le biais du survivant consiste à tirer des conclusions à partir des seuls cas visibles, en oubliant que les autres ont disparu du champ de vision précisément parce qu'ils ont échoué.",
    },
    {
      type: "heading",
      text: "Une expérience de pensée",
    },
    {
      type: "paragraph",
      text: "Prenez dix mille personnes qui tirent à pile ou face. Après dix tirages, une dizaine d'entre elles auront obtenu pile dix fois de suite. Interrogées, elles pourraient décrire une méthode, un ressenti, une discipline. Il n'y a pourtant que du hasard.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Sur un marché où des millions de personnes tentent leur chance, certaines afficheront des résultats spectaculaires par le seul effet du nombre. Leur existence ne prouve pas qu'une méthode fonctionne.",
    },
    {
      type: "heading",
      text: "Comment le biais se manifeste",
    },
    {
      type: "list",
      items: [
        "Les captures d'écran de gains circulent ; celles de pertes, non.",
        "Les classements de traders n'affichent que ceux qui sont encore actifs.",
        "Les tokens qui ont fait × 100 sont racontés partout ; les milliers tombés à zéro, jamais.",
        "Un historique de performance ne commence souvent qu'au moment où il devient flatteur.",
      ],
    },
    {
      type: "heading",
      text: "La question à se poser",
    },
    {
      type: "paragraph",
      text: "Devant une performance affichée, la question utile n'est pas « comment a-t-il fait ? » mais « combien de personnes ont fait exactement la même chose, et où sont-elles aujourd'hui ? ». C'est le dénominateur qui manque presque toujours.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Un classement de traders à copier est, par construction, une liste de survivants. Ceux qui ont perdu n'y figurent plus.",
    },
  ],
};
