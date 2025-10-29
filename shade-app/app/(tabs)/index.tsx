import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

/**
 * Page d'accueil principale de l'application (avec bottom navigation)
 */
export default function HomeScreen() {
  /**
   * Gère la "déconnexion" de l'utilisateur
   */
  const handleLogout = () => {
    router.replace("/welcome");
  };

  return (
    <View className="flex-1 items-center justify-center bg-primary p-md">
      <Text className="text-xl font-bold text-text-primary mb-xl">
        Welcome to Nativewind! INDEX
      </Text>

      <View className="gap-md w-full max-w-xs">
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
    </View>
  );
}
