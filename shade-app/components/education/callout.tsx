import { View, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { CalloutVariant } from "@/content/education/types";

interface CalloutProps {
  variant: CalloutVariant;
  text: string;
}

/** Icône et couleur associées à chaque variante (couleurs du design system). */
const VARIANT_CONFIG: Record<
  CalloutVariant,
  { icon: string; color: string; label: string }
> = {
  info: { icon: "info", color: "#6283FA", label: "Bon à savoir" }, // secondary
  warning: { icon: "alert-triangle", color: "#FF6A00", label: "Attention" }, // novalidation
  key: { icon: "key", color: "#58FAAE", label: "À retenir" }, // validation
};

/**
 * Encadré mis en avant au sein d'une leçon.
 * Trois variantes : info, attention, à retenir.
 */
export function Callout({ variant, text }: CalloutProps) {
  const { icon, color, label } = VARIANT_CONFIG[variant];

  return (
    <View
      className="my-sm rounded-md p-md"
      style={{
        backgroundColor: `${color}1A`, // ~10% d'opacité
        borderLeftWidth: 3,
        borderLeftColor: color,
      }}
    >
      <View className="mb-xs flex-row items-center gap-xs">
        <Feather name={icon as any} size={14} color={color} />
        <Text
          className="font-satoshi text-xs font-bold uppercase"
          style={{ color }}
        >
          {label}
        </Text>
      </View>
      <Text className="font-satoshi text-sm leading-6 text-text-primary">
        {text}
      </Text>
    </View>
  );
}
