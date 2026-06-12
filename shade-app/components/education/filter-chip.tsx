import { Text, TouchableOpacity } from "react-native";

interface FilterChipProps {
  label: string;
  /** Chip actuellement sélectionnée */
  active: boolean;
  onPress: () => void;
}

/**
 * Pastille de filtre cliquable (utilisée pour filtrer le glossaire par thème).
 * État actif : fond bleu (secondary) ; inactif : fond carte.
 */
export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      className={`mr-sm rounded-md px-md py-sm ${
        active ? "bg-secondary" : "bg-cards"
      }`}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text
        className={`font-satoshi text-sm ${
          active ? "font-bold text-text-primary" : "text-text-secondary"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
