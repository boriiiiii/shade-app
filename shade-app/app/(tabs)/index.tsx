import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useState, useEffect } from "react";
import { getApiStatus, ApiData } from "@/lib/api";

/**
 * Page d'accueil principale de l'application (avec bottom navigation)
 */
export default function HomeScreen() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupère les données de l'API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getApiStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    router.replace("/welcome");
  };

  return (
    <View className="flex-1 items-center justify-center bg-primary p-md">
      <Text className="text-xl font-bold text-text-primary mb-xl">
        Shade App
      </Text>

      {/* Chargement */}
      {loading && (
        <View className="mb-md">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-text-secondary mt-sm">Chargement...</Text>
        </View>
      )}

      {/* Erreur */}
      {error && !loading && (
        <View className="bg-red-100 p-md rounded-lg mb-md">
          <Text className="text-red-600 font-semibold">Erreur: {error}</Text>
          <Pressable className="bg-red-500 px-md py-sm rounded mt-sm" onPress={fetchData}>
            <Text className="text-white text-center">Réessayer</Text>
          </Pressable>
        </View>
      )}

      {/* Données */}
      {data && !loading && (
        <View className="w-full max-w-md mb-md">
          <View className="bg-white rounded-lg p-lg shadow-sm">
            <Text className="text-lg font-bold mb-md">API Status</Text>
            <Text className="text-text-secondary">Message: {data.hello}</Text>
            <Text className="text-text-secondary mt-sm">
              Supabase: {data.supabase_configured ? "✅ Configuré" : "❌ Non configuré"}
            </Text>
          </View>
          
          <Pressable className="bg-blue-500 px-lg py-md rounded-lg mt-md" onPress={fetchData}>
            <Text className="text-white font-semibold text-center">🔄 Rafraîchir</Text>
          </Pressable>
        </View>
      )}

      {/* Déconnexion */}
      <Pressable
        className="bg-invalidation px-lg py-md rounded-lg mt-xl"
        onPress={handleLogout}
      >
        <View className="flex-row items-center justify-center gap-2">
          <Feather name="log-out" size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold text-center">
            Déconnexion
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
