import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { CATEGORIES } from "@/content/education/categories";
import { getLessonsByCategory } from "@/content/education/lessons";
import { CategoryCard, Disclaimer } from "@/components/education";

/**
 * Accueil de l'espace Éducation.
 * Liste les catégories, donne accès au glossaire et rappelle le disclaimer.
 */
export default function LearnHomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 21,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête */}
        <Text className="font-satoshi text-2xl font-bold text-text-primary">
          Éducation
        </Text>
        <Text className="mt-xs font-satoshi text-sm text-text-secondary">
          Comprends la crypto et son écosystème, à ton rythme.
        </Text>

        {/* Accès rapide au glossaire */}
        <TouchableOpacity
          className="mt-lg mb-lg flex-row items-center gap-md rounded-lg bg-cards p-lg"
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/learn/glossary")}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-md"
            style={{ backgroundColor: "#6283FA26" }}
          >
            <Feather name="book-open" size={22} color="#6283FA" />
          </View>
          <View className="flex-1">
            <Text className="font-satoshi text-base font-bold text-text-primary">
              Glossaire
            </Text>
            <Text className="mt-xs font-satoshi text-sm text-text-secondary">
              Le vocabulaire crypto expliqué simplement.
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#6B6B6B" />
        </TouchableOpacity>

        {/* Catégories */}
        <Text className="mb-md font-satoshi text-lg font-bold text-text-primary">
          Parcours
        </Text>
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            lessonCount={getLessonsByCategory(category.id).length}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/learn/[categoryId]",
                params: { categoryId: category.id },
              })
            }
          />
        ))}

        <Disclaimer className="mt-md" />
      </ScrollView>
    </View>
  );
}
