import { View, Text, Image } from "react-native";
import { LessonBlock as LessonBlockType } from "@/content/education/types";
import { Callout } from "./callout";

interface LessonBlockProps {
  block: LessonBlockType;
}

/**
 * Rend un bloc de contenu de leçon selon son type.
 * Point d'entrée unique du rendu : ajouter un nouveau type de bloc
 * revient à ajouter un `case` ici.
 */
export function LessonBlock({ block }: LessonBlockProps) {
  switch (block.type) {
    case "paragraph":
      return (
        <Text className="my-sm font-satoshi text-base leading-7 text-text-secondary">
          {block.text}
        </Text>
      );

    case "heading":
      return (
        <Text className="mb-sm mt-lg font-satoshi text-lg font-bold text-text-primary">
          {block.text}
        </Text>
      );

    case "callout":
      return <Callout variant={block.variant} text={block.text} />;

    case "list":
      return (
        <View className="my-sm gap-sm">
          {block.items.map((item, index) => (
            <View key={index} className="flex-row gap-sm">
              <Text className="font-satoshi text-base text-secondary">•</Text>
              <Text className="flex-1 font-satoshi text-base leading-7 text-text-secondary">
                {item}
              </Text>
            </View>
          ))}
        </View>
      );

    case "image":
      return (
        <View className="my-md">
          <Image
            source={block.src}
            className="h-48 w-full rounded-md"
            resizeMode="cover"
          />
          {block.caption ? (
            <Text className="mt-xs text-center font-satoshi text-xs text-text-muted">
              {block.caption}
            </Text>
          ) : null}
        </View>
      );

    default:
      return null;
  }
}
