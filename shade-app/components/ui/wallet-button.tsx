/**
 * Ré-export du composant WalletButton.
 *
 * Les écrans login/sign_up importent depuis `@/components/ui/wallet-button`,
 * alors que l'implémentation vit dans `components/wallet-button.tsx`.
 * Ce module fait le pont pour conserver les deux chemins d'import valides.
 */
export { WalletButton } from "../wallet-button";
