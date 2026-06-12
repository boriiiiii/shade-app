/**
 * Types du contenu éducatif (stockage local)
 *
 * Le contenu d'une leçon est décrit sous forme de "blocs" : chaque bloc
 * représente un élément de rendu (paragraphe, titre, encadré, liste, image).
 * Le composant LessonBlock se charge de rendre chaque type via un switch.
 * Ce format permet un contenu riche sans dépendre d'une librairie MDX.
 */

/** Niveau de difficulté d'une leçon */
export type Level = "debutant" | "intermediaire" | "avance";

/** Variante visuelle d'un encadré (callout) */
export type CalloutVariant = "info" | "warning" | "key";

/**
 * Un bloc de contenu au sein d'une leçon.
 * Union discriminée par le champ `type`.
 */
export type LessonBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "callout"; variant: CalloutVariant; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: number; caption?: string };

/** Une leçon complète */
export interface Lesson {
  /** Identifiant unique (slug) */
  id: string;
  /** Identifiant de la catégorie de rattachement */
  categoryId: string;
  /** Titre affiché */
  title: string;
  /** Résumé court (carte + en-tête de leçon) */
  summary: string;
  /** Niveau de difficulté */
  level: Level;
  /** Temps de lecture estimé en minutes */
  readingMinutes: number;
  /** Contenu de la leçon, sous forme de blocs ordonnés */
  blocks: LessonBlock[];
}

/** Une catégorie regroupant plusieurs leçons */
export interface Category {
  /** Identifiant unique (slug) */
  id: string;
  /** Titre affiché */
  title: string;
  /** Description courte */
  description: string;
  /** Nom d'icône Feather (@expo/vector-icons) */
  icon: string;
  /** Couleur d'accent (token du design system ou hex) */
  accentColor: string;
}

/** Identifiant de thème du glossaire */
export type GlossaryThemeId =
  | "fondamentaux"
  | "securite"
  | "trading"
  | "defi-nft";

/** Un thème de regroupement des termes du glossaire */
export interface GlossaryTheme {
  id: GlossaryThemeId;
  /** Libellé affiché dans le filtre */
  label: string;
}

/** Une entrée du glossaire */
export interface GlossaryTerm {
  /** Le terme */
  term: string;
  /** Définition neutre et pédagogique */
  definition: string;
  /** Thème de rattachement (pour le filtrage) */
  theme: GlossaryThemeId;
}
