import { View, Text } from "react-native";
import { Level } from "@/content/education/types";

interface LevelBadgeProps {
  level: Level;
}

/** Libellé et couleur associés à chaque niveau (couleurs du design system). */
const LEVEL_CONFIG: Record<Level, { label: string; color: string }> = {
  debutant: { label: "Débutant", color: "#58FAAE" }, // validation
  intermediaire: { label: "Intermédiaire", color: "#6283FA" }, // secondary
  avance: { label: "Avancé", color: "#FF6A00" }, // novalidation
};

/**
 * Pastille indiquant le niveau de difficulté d'une leçon.
 * Composant réutilisable affiché sur les cartes et en-têtes de leçon.
 */
export function LevelBadge({ level }: LevelBadgeProps) {
  const { label, color } = LEVEL_CONFIG[level];

  return (
    <View
      className="self-start rounded-sm px-sm py-xs"
      style={{ backgroundColor: `${color}26` }} // ~15% d'opacité
    >
      <Text className="font-satoshi text-xs font-medium" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
