import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { NewsPost } from "@/lib/news";
import { MediaGrid } from "./media-grid";

interface PostCardProps {
  post: NewsPost;
}

/** Formate une date ISO en durée relative compacte (« 3 h », « 2 j »). */
function timeAgo(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Carte d'un post (tweet) dans le feed News, inspirée de l'interface X/Twitter.
 * Au tap : ouvre le post original sur X dans un navigateur intégré.
 */
export function PostCard({ post }: PostCardProps) {
  const openPost = () => {
    if (post.url) WebBrowser.openBrowserAsync(post.url);
  };

  const relative = timeAgo(post.created_at);

  return (
    <TouchableOpacity
      className="mb-md rounded-lg bg-cards p-lg"
      activeOpacity={0.85}
      onPress={openPost}
    >
      <View className="flex-row gap-sm">
        {/* Avatar */}
        {post.avatar ? (
          <Image
            source={{ uri: post.avatar }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-11 w-11 items-center justify-center rounded-full bg-padding">
            <Feather name="user" size={18} color="#6B6B6B" />
          </View>
        )}

        {/* Colonne de droite : en-tête + contenu */}
        <View className="flex-1">
          {/* En-tête : nom · @handle · temps + logo X */}
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center pr-sm">
              <Text
                className="font-satoshi text-sm font-bold text-text-primary"
                numberOfLines={1}
              >
                {post.author}
              </Text>
              <Text
                className="ml-1 flex-shrink font-satoshi text-xs text-text-muted"
                numberOfLines={1}
              >
                @{post.handle}
                {relative ? ` · ${relative}` : ""}
              </Text>
            </View>
            <FontAwesome6 name="x-twitter" size={15} color="#FFFFFF" />
          </View>

          {/* Texte */}
          {post.text ? (
            <Text className="mt-xs font-satoshi text-sm leading-5 text-text-primary">
              {post.text}
            </Text>
          ) : null}

          {/* Média */}
          <MediaGrid urls={post.media} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
