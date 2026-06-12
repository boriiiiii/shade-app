import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { getCategory } from "@/content/education/categories";
import { getLessonsByCategory } from "@/content/education/lessons";
import { LessonCard } from "@/components/education";

/**
 * Liste des leçons d'une catégorie.
 */
export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  const category = getCategory(categoryId);
  const lessons = getLessonsByCategory(categoryId);

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 21,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Bouton retour */}
        <TouchableOpacity
          className="mb-lg h-10 w-10 items-center justify-center rounded-md bg-cards"
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* En-tête de catégorie */}
        <Text className="font-satoshi text-2xl font-bold text-text-primary">
          {category?.title ?? "Catégorie"}
        </Text>
        {category?.description ? (
          <Text className="mt-xs mb-lg font-satoshi text-sm text-text-secondary">
            {category.description}
          </Text>
        ) : null}

        {/* Liste des leçons */}
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/learn/lesson/[id]",
                  params: { id: lesson.id },
                })
              }
            />
          ))
        ) : (
          <Text className="mt-md font-satoshi text-sm text-text-muted">
            Les leçons de cette catégorie arrivent bientôt.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
