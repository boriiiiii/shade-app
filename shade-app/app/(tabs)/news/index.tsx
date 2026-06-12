import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { getNewsFeed, NewsPost } from "@/lib/news";
import { PostCard } from "@/components/news";

/**
 * Feed News : derniers posts des comptes suivis (Twitter/X), agrégés par l'API.
 */
export default function NewsFeedScreen() {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const feed = await getNewsFeed();
      setPosts(feed.posts);
      setFromCache(feed.from_cache);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Recharge en revenant de l'écran de gestion des canaux.
  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load])
  );

  return (
    <View className="flex-1 bg-primary">
      {/* En-tête */}
      <View
        className="flex-row items-center justify-between px-app-h pb-md"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-1 pr-md">
          <View className="flex-row items-center gap-sm">
            <Text className="font-satoshi text-2xl font-bold text-text-primary">
              News
            </Text>
            <View className="flex-row items-center gap-xs rounded-full bg-padding px-sm py-xs">
              <FontAwesome6 name="x-twitter" size={11} color="#FFFFFF" />
              <Text className="font-satoshi text-xs text-text-secondary">via X</Text>
            </View>
          </View>
          <Text className="mt-xs font-satoshi text-sm text-text-secondary">
            L'actu crypto de tes comptes suivis.
          </Text>
        </View>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-md bg-cards"
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/news/channels")}
        >
          <Feather name="sliders" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bandeau cache (source live indisponible) */}
      {fromCache && !loading ? (
        <View className="mx-app-h mb-sm flex-row items-center gap-sm rounded-md bg-cards px-md py-sm">
          <Feather name="wifi-off" size={13} color="#BFBFBF" />
          <Text className="flex-1 font-satoshi text-xs text-text-secondary">
            Source temporairement indisponible — affichage des derniers posts en
            cache.
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6283FA" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-app-h">
          <Feather name="alert-circle" size={28} color="#FA7272" />
          <Text className="mt-md text-center font-satoshi text-sm text-text-secondary">
            {error}
          </Text>
          <Text className="mt-xs text-center font-satoshi text-xs text-text-muted">
            Vérifie que l'API est démarrée (EXPO_PUBLIC_API_URL).
          </Text>
          <TouchableOpacity
            className="mt-md rounded-md bg-secondary px-lg py-md"
            activeOpacity={0.8}
            onPress={() => load()}
          >
            <Text className="font-satoshi text-sm font-bold text-text-primary">
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => `${item.handle}-${item.id}`}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={{
            paddingHorizontal: 21,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#6283FA"
            />
          }
          ListEmptyComponent={
            <Text className="mt-xl text-center font-satoshi text-sm text-text-muted">
              Aucun post pour le moment. Ajoute des comptes via l'icône en haut à
              droite.
            </Text>
          }
        />
      )}
    </View>
  );
}
