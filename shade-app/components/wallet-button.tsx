import React from "react";
import { Text, TouchableOpacity, View, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Proportions basées sur l'écran
const BUTTON_WIDTH = screenWidth * 0.8244; // 82.44%
const BUTTON_HEIGHT = screenHeight * 0.0702; // 7.02%
const BUTTON_MARGIN_TOP = screenHeight * 0.02; // 2%

// Proportions de l'icône basées sur le bouton
const ICON_SIZE = BUTTON_HEIGHT * 0.50; // 50% de la hauteur du bouton

// Paddings basés sur le bouton
const PADDING_TOP = BUTTON_HEIGHT * 0.1672; // 16.72%
const PADDING_BOTTOM = BUTTON_HEIGHT * 0.2508; // 25.08%
const PADDING_LEFT = BUTTON_WIDTH * 0.0772; // 7.72%

interface WalletButtonProps {
  /** Nom du wallet (ex: "Coinbase", "Metamask") */
  name: string;
  /** Composant SVG de l'icône du wallet */
  Icon: React.FC<{ width: number; height: number }>;
  /** Callback appelé lors du clic */
  onPress: () => void;
  /** Première occurrence (sans marge top) */
  isFirst?: boolean;
}

/**
 * Bouton de connexion/inscription via wallet
 * Composant réutilisable pour afficher un wallet avec son icône
 * Proportions responsive basées sur la taille de l'écran
 */
export function WalletButton({ name, Icon, onPress, isFirst = false }: WalletButtonProps) {
  return (
    <TouchableOpacity
      className="bg-cards rounded-3xl flex-row items-center"
      style={{
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        marginTop: isFirst ? 0 : BUTTON_MARGIN_TOP,
        paddingTop: PADDING_TOP,
        paddingBottom: PADDING_BOTTOM,
        paddingLeft: PADDING_LEFT,
      }}
      onPress={onPress}
    >
      <View 
        className="justify-center items-center"
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
      >
        <Icon width={ICON_SIZE} height={ICON_SIZE} />
      </View>
      <Text className="text-white font-satoshi font-medium text-xl ml-4">
        {name}
      </Text>
    </TouchableOpacity>
  );
}
