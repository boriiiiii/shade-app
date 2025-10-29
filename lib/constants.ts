/**
 * Constantes de l'application
 * Centralise toutes les valeurs réutilisables pour faciliter la maintenance
 */

/**
 * Dimensions et espacements pour les layouts
 */
export const LAYOUT = {
  /** Marge supérieure de la liste de wallets */
  walletListTopMargin: 126,
  /** Largeur du conteneur de wallets en pourcentage */
  walletContainerWidth: '85%',
  /** Padding horizontal des écrans principaux */
  screenPaddingHorizontal: 21,
  /** Padding vertical des écrans principaux */
  screenPaddingVertical: 21,
  /** Padding top des écrans principaux */
  screenPaddingTop: 60,
  /** Marge inférieure des boutons d'action */
  actionButtonsBottom: 62,
} as const;

/**
 * Configuration des boutons de wallets
 */
export const WALLET_BUTTON = {
  /** Hauteur des boutons de wallet */
  height: 60,
  /** Padding horizontal des boutons */
  paddingHorizontal: 24,
  /** Espacement entre les boutons */
  marginTop: 20,
  /** Taille des icônes de wallet */
  iconSize: 28,
} as const;

/**
 * Liste des wallets supportés
 * Permet de gérer facilement l'ajout/suppression de wallets
 */
export const SUPPORTED_WALLETS = [
  'Coinbase',
  'Metamask',
  'Binance',
  'Phantom',
] as const;

export type WalletName = typeof SUPPORTED_WALLETS[number];
