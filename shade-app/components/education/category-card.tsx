import { Text, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Category } from "@/content/education/types";

interface CategoryCardProps {
  category: Category;
  /** Nombre de leçons dans la catégorie */
  lessonCount: number;
  onPress: () => void;
}

/**
 * Carte représentant une catégorie de l'espace Éducation.
 * Affiche l'icône accentuée, le titre, la description et le nombre de leçons.
 */
export function CategoryCard({
  category,
  lessonCount,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      className="mb-md flex-row items-center gap-md rounded-lg bg-cards p-lg"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-md"
        style={{ backgroundColor: `${category.accentColor}26` }}
      >
        <Feather
          name={category.icon as any}
          size={22}
          color={category.accentColor}
        />
      </View>

      <View className="flex-1">
        <Text className="font-satoshi text-base font-bold text-text-primary">
          {category.title}
        </Text>
        <Text className="mt-xs font-satoshi text-sm text-text-secondary">
          {category.description}
        </Text>
        <Text className="mt-sm font-satoshi text-xs text-text-muted">
          {lessonCount} leçon{lessonCount > 1 ? "s" : ""}
        </Text>
      </View>

      <Feather name="chevron-right" size={20} color="#6B6B6B" />
    </TouchableOpacity>
  );
}
