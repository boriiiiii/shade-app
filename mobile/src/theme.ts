import { Platform } from 'react-native';
import type { LogLevel } from './types';

/** Police monospace native (façon Courier). Voir README pour bundler JetBrains Mono. */
export const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })!;

/** Palette "phosphore" façon vieux terminal Unix. */
export const colors = {
  bg: '#050806',
  bgPanel: '#0a0f0b',
  border: '#173222',
  green: '#33ff88', // texte primaire (phosphore)
  greenDim: '#1f8a4c',
  amber: '#ffc24d', // accents / warnings
  red: '#ff5f56',
  cyan: '#5cd6ff', // détections
  magenta: '#c792ea', // trades
  gray: '#5c6b62', // système / atténué
  white: '#e8ffe8',
};

/** Couleur d'affichage selon le niveau de log. */
export const levelColor: Record<LogLevel, string> = {
  info: colors.white,
  ok: colors.green,
  warn: colors.amber,
  error: colors.red,
  detect: colors.cyan,
  trade: colors.magenta,
  sys: colors.gray,
};

/** Préfixe court affiché devant chaque ligne. */
export const levelTag: Record<LogLevel, string> = {
  info: '   ',
  ok: ' ok',
  warn: '  !',
  error: '  ✘',
  detect: ' >>',
  trade: '  $',
  sys: '  ·',
};
