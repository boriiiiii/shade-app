import { View } from "react-native";
import { Image } from "expo-image";

interface MediaGridProps {
  urls: string[];
}

/**
 * Une image de la grille. Les dimensions sont passées via `style` (et non
 * `className`) car NativeWind ne stylise pas `expo-image` par défaut.
 */
function Cell({
  uri,
  height,
  flex = false,
}: {
  uri: string;
  height: number;
  flex?: boolean;
}) {
  return (
    <Image
      source={{ uri }}
      style={flex ? { flex: 1, height } : { width: "100%", height }}
      contentFit="cover"
      transition={150}
    />
  );
}

/**
 * Grille d'images d'un post, façon Twitter/X :
 * 1 image pleine largeur, 2 côte à côte, 3 (une grande + deux), 4 en 2×2.
 */
export function MediaGrid({ urls }: MediaGridProps) {
  const media = urls.slice(0, 4);
  if (media.length === 0) return null;

  if (media.length === 1) {
    return (
      <View className="mt-md overflow-hidden rounded-lg">
        <Cell uri={media[0]} height={208} />
      </View>
    );
  }

  if (media.length === 2) {
    return (
      <View className="mt-md flex-row gap-1 overflow-hidden rounded-lg">
        <Cell uri={media[0]} height={176} flex />
        <Cell uri={media[1]} height={176} flex />
      </View>
    );
  }

  if (media.length === 3) {
    return (
      <View className="mt-md gap-1 overflow-hidden rounded-lg">
        <Cell uri={media[0]} height={160} />
        <View className="flex-row gap-1">
          <Cell uri={media[1]} height={112} flex />
          <Cell uri={media[2]} height={112} flex />
        </View>
      </View>
    );
  }

  return (
    <View className="mt-md gap-1 overflow-hidden rounded-lg">
      <View className="flex-row gap-1">
        <Cell uri={media[0]} height={112} flex />
        <Cell uri={media[1]} height={112} flex />
      </View>
      <View className="flex-row gap-1">
        <Cell uri={media[2]} height={112} flex />
        <Cell uri={media[3]} height={112} flex />
      </View>
    </View>
  );
}
