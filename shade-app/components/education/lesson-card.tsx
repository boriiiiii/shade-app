import { Text, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Lesson } from "@/content/education/types";
import { LevelBadge } from "./level-badge";

interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
}

/**
 * Carte représentant une leçon dans la liste d'une catégorie.
 * Affiche titre, résumé, badge de niveau et temps de lecture.
 */
export function LessonCard({ lesson, onPress }: LessonCardProps) {
  return (
    <TouchableOpacity
      className="mb-md rounded-lg bg-cards p-lg"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text className="font-satoshi text-base font-bold text-text-primary">
        {lesson.title}
      </Text>
      <Text className="mt-xs font-satoshi text-sm leading-5 text-text-secondary">
        {lesson.summary}
      </Text>

      <View className="mt-md flex-row items-center justify-between">
        <LevelBadge level={lesson.level} />
        <View className="flex-row items-center gap-xs">
          <Feather name="clock" size={13} color="#6B6B6B" />
          <Text className="font-satoshi text-xs text-text-muted">
            {lesson.readingMinutes} min
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
