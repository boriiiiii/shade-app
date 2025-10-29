import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

/**
 * Page de profil utilisateur
 * Accessible depuis la navigation principale, s'affiche sans bottom tabs
 */
export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-primary items-center justify-center p-md">
      <Text className="text-text-primary text-2xl font-bold mb-lg">
        Profile Screen
      </Text>
      <Text className="text-text-secondary text-center mb-xl">
        Cet écran n'a pas de bottom navigation bar !
      </Text>

      <Pressable
        className="bg-secondary px-lg py-md rounded-lg"
        onPress={() => router.back()}
      >
        <Text className="text-text-primary font-semibold">Retour</Text>
      </Pressable>
    </View>
  );
}
