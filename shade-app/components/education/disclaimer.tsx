import { View, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";

interface DisclaimerProps {
  /** Marge supérieure optionnelle (ex: "mt-lg") */
  className?: string;
}

/**
 * Bandeau d'avertissement réutilisable.
 * Rappelle que le contenu est éducatif et ne constitue pas un conseil financier.
 * Affiché sur l'accueil Éducation et en pied de chaque leçon.
 */
export function Disclaimer({ className = "" }: DisclaimerProps) {
  return (
    <View
      className={`flex-row items-start gap-sm rounded-md bg-cards p-md ${className}`}
    >
      <Feather name="info" size={16} color="#BFBFBF" style={{ marginTop: 2 }} />
      <Text className="flex-1 font-satoshi text-xs leading-5 text-text-secondary">
        Contenu strictement éducatif. Ces informations ne constituent pas un
        conseil financier, fiscal ou d'investissement. Toute décision relève de
        votre seule responsabilité.
      </Text>
    </View>
  );
}
