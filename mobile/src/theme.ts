import type { LogLevel } from './types';

/**
 * Design system Shade — valeurs relevées sur la maquette Figma
 * (fichier zKaomEZpDKyRQDzR3UzDR3, page « Prototype »).
 *
 * Remplace la palette « phosphore » du MVP terminal. Les clés historiques de
 * `colors` sont conservées telles quelles pour ne rien casser dans les écrans
 * existants : seules leurs valeurs changent. Les nouveaux tokens Shade sont
 * ajoutés à côté.
 */

/**
 * Police du produit : Satoshi, comme sur la maquette Figma
 * (« Satoshi Variable: Medium » pour le courant, « Bold » pour les titres).
 *
 * Les fichiers .otf vivent dans `assets/fonts/` et sont chargés par `useFonts`
 * dans App.tsx. Tant que le chargement n'est pas terminé, App.tsx n'affiche
 * rien : ces noms de famille sont donc toujours résolus au moment du rendu.
 */
export const FONT = 'Satoshi-Medium';

/** Variante grasse : titres, valeurs mises en avant, onglet actif. */
export const FONT_BOLD = 'Satoshi-Bold';

/** Variante normale, pour les longs paragraphes (Academy). */
export const FONT_REGULAR = 'Satoshi-Regular';

/** Familles à charger au démarrage. Consommé par `useFonts` dans App.tsx. */
export const FONT_ASSETS = {
  'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
  'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
  'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
};

/** Palette Shade. Les 5 premières sont les variables déclarées dans Figma. */
export const colors = {
  // --- Variables Figma ---
  /** `Primary` — fond d'écran */
  primary: '#121418',
  /** `Secondary` — accent bleu (actif, CTA, icône sélectionnée) */
  secondary: '#6283fa',
  /** `Text` */
  text: '#ffffff',
  /** `Text Second` */
  textSecond: '#bfbfbf',
  /** `Main shape` — violet clair, illustrations et accents secondaires */
  mainShape: '#af99fe',

  // --- Relevés sur les écrans ---
  /** Fond des cartes */
  card: '#2a2a2a',
  /** Fond des surfaces intermédiaires */
  surface: '#1a1a1a',
  /** Hausse / succès */
  up: '#58faae',
  /** Baisse / erreur */
  down: '#ff5151',
  /** Texte tertiaire, libellés atténués */
  muted: '#6b6b6b',
  /** Gris des icônes inactives (relevé sur les SVG exportés) */
  accent: '#4d4d4d',

  // --- Traitement « verre » ---
  // La maquette pose ses surfaces secondaires en #2a2a2a à 30 %, mais elles y
  // reposent sur le fond de page. Ici les interrupteurs et les champs vivent
  // DANS des cartes #2a2a2a : un voile sombre par-dessus y devient invisible.
  // On utilise donc un voile clair, qui se détache sur n'importe quel fond —
  // c'est aussi ce qui donne son aspect au verre dépoli.
  /** Voile clair des surfaces interactives : boutons, interrupteurs, champs. */
  glassFill: 'rgba(255,255,255,0.06)',
  /** Voile clair appuyé, pour les éléments qui doivent ressortir davantage. */
  glassFillStrong: 'rgba(255,255,255,0.1)',
  /** Liseré clair : la signature visuelle du verre. */
  glassBorder: 'rgba(255,255,255,0.12)',

  // --- Clés historiques du MVP, remappées sur la charte Shade ---
  /** @deprecated utiliser `primary` */
  bg: '#121418',
  /** @deprecated utiliser `surface` */
  bgPanel: '#1a1a1a',
  border: '#2a2a2a',
  /** @deprecated ex-vert phosphore, désormais l'accent bleu */
  green: '#6283fa',
  /** @deprecated */
  greenDim: '#bfbfbf',
  /** @deprecated utiliser `up` */
  amber: '#58faae',
  /** @deprecated utiliser `down` */
  red: '#ff5151',
  /** @deprecated */
  cyan: '#6283fa',
  /** @deprecated utiliser `mainShape` */
  magenta: '#af99fe',
  /** @deprecated utiliser `muted` */
  gray: '#6b6b6b',
  /** @deprecated utiliser `text` */
  white: '#ffffff',
};

/** Rayons relevés sur la maquette. */
export const radius = {
  sm: 8,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 40,
  /** Pills : barre de navigation flottante, badges */
  pill: 50,
};

/**
 * Espacements. `screen` est la marge latérale : la maquette est en 393 px de
 * large pour un contenu de 351 px, soit 21 px de chaque côté.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 21,
  /** Retrait haut du contenu sous la status bar */
  top: 60,
};

/** Échelle typographique relevée sur la maquette. */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 17,
  display: 52,
};

/** Couleur d'affichage selon le niveau de log. */
export const levelColor: Record<LogLevel, string> = {
  info: colors.text,
  ok: colors.up,
  warn: colors.mainShape,
  error: colors.down,
  detect: colors.secondary,
  trade: colors.mainShape,
  sys: colors.muted,
};

/**
 * Libellé court affiché devant chaque ligne de log.
 * Les marqueurs ASCII du terminal (`>>`, `$`, `✘`) sont remplacés par des
 * libellés lisibles : c'est la couleur qui porte désormais le niveau.
 */
export const levelTag: Record<LogLevel, string> = {
  info: '',
  ok: '✓',
  warn: '!',
  error: '✕',
  detect: '•',
  trade: '⇄',
  sys: '',
};
