import "../global.css";

import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "../lib/auth/AuthContext";
import { resolvePhantomResponse } from "../lib/wallet";
import { colors } from "../lib/theme";

function RootNavigator() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Route guard: keep unauthenticated users in (auth), authenticated users in (app).
  useEffect(() => {
    if (status === "loading") return;
    const inAuthGroup = segments[0] === "(auth)";
    if (status === "unauthenticated" && !inAuthGroup) {
      router.replace("/(auth)/connect");
    } else if (status === "authenticated" && inAuthGroup) {
      router.replace("/");
    }
  }, [status, segments, router]);

  // Forward Phantom deep-link responses to the wallet adapter.
  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      resolvePhantomResponse(url);
    });
    Linking.getInitialURL().then((url) => {
      if (url) resolvePhantomResponse(url);
    });
    return () => sub.remove();
  }, []);

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
