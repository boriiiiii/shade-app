import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

/**
 * Page des paramètres de l'application
 * Accessible depuis la navigation principale, s'affiche sans bottom tabs
 */
export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-cards items-center justify-center p-md">
      <Text className="text-text-primary text-2xl font-bold mb-lg">
        Settings Screen
      </Text>
      <Text className="text-text-secondary text-center mb-xl">
        Un autre écran sans bottom navigation !
      </Text>

      <Pressable
        className="bg-validation px-lg py-md rounded-lg"
        onPress={() => router.back()}
      >
        <Text className="text-primary font-semibold">Retour aux tabs</Text>
      </Pressable>
    </View>
  );
}
