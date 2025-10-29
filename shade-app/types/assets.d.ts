/**
 * Déclaration de types pour les imports d'assets
 * Permet à TypeScript de comprendre les imports de fichiers non-TypeScript
 */

/**
 * Type pour les imports d'images PNG
 * React Native transforme les PNG en identifiants numériques de ressources
 */
declare module "*.png" {
  const value: number;
  export default value;
}

/**
 * Type pour les imports de fichiers SVG
 * react-native-svg transforme les SVG en composants React
 */
declare module "*.svg" {
  import type React from "react";
  import type { SvgProps } from "react-native-svg";
  
  const content: React.FC<SvgProps>;
  export default content;
}
