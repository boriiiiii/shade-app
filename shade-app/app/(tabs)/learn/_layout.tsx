import { Stack } from "expo-router";

/**
 * Stack interne de l'espace Éducation.
 * Permet la navigation accueil → catégorie → leçon, et vers le glossaire.
 */
export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#121418" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[categoryId]" />
      <Stack.Screen name="lesson/[id]" />
      <Stack.Screen name="glossary" />
    </Stack>
  );
}
