import { Stack } from "expo-router";

/**
 * Stack interne de la section News (feed → gestion des canaux).
 */
export default function NewsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#121418" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="channels" />
    </Stack>
  );
}
