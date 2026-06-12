import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { getLesson } from "@/content/education/lessons";
import { LessonBlock, LevelBadge, Disclaimer } from "@/components/education";

/**
 * Lecteur d'une leçon : en-tête, rendu des blocs de contenu, disclaimer.
 */
export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const lesson = getLesson(id);

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 21,
          paddingBottom: 40,
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

        {lesson ? (
          <>
            {/* En-tête de leçon */}
            <Text className="font-satoshi text-2xl font-bold leading-8 text-text-primary">
              {lesson.title}
            </Text>
            <View className="mt-md flex-row items-center gap-md">
              <LevelBadge level={lesson.level} />
              <View className="flex-row items-center gap-xs">
                <Feather name="clock" size={13} color="#6B6B6B" />
                <Text className="font-satoshi text-xs text-text-muted">
                  {lesson.readingMinutes} min
                </Text>
              </View>
            </View>

            {/* Contenu */}
            <View className="mt-md">
              {lesson.blocks.map((block, index) => (
                <LessonBlock key={index} block={block} />
              ))}
            </View>

            <Disclaimer className="mt-xl" />
          </>
        ) : (
          <Text className="mt-md font-satoshi text-sm text-text-muted">
            Leçon introuvable.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
