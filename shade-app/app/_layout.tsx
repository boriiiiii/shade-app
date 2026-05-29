import { Buffer } from 'buffer';
import { BackHandler } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import 'text-encoding';
global.Buffer = Buffer;

// Polyfill for deprecated BackHandler.removeEventListener
if (BackHandler && !(BackHandler as any).removeEventListener) {
  (BackHandler as any).removeEventListener = () => { };
}

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { WalletConnectModal } from '@walletconnect/modal-react-native';
import { WalletProvider } from "@/lib/wallet-store";

// Empêche le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore l'erreur si le splash screen n'est pas disponible
});

const projectId = process.env.EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID || '4f9c7116394cce52212c2ebc23a131ab';

const providerMetadata = {
  name: 'Shade',
  description: 'Shade - Your Crypto Side Wallet App',
  url: 'https://shade.app',
  icons: ['https://shade.app/icon.png'],
  redirect: {
    native: 'shadeapp://',
    universal: 'https://shade.app'
  }
};

/**
 * Layout racine de l'application
 * Gère le chargement des polices et la configuration globale de la navigation
 */
export default function RootLayout() {
  // Chargement des différentes variantes de la police Satoshi
  const [loaded] = useFonts({
    "Satoshi-Light": require("../assets/fonts/Satoshi-Light.otf"),
    "Satoshi-LightItalic": require("../assets/fonts/Satoshi-LightItalic.otf"),
    "Satoshi-Regular": require("../assets/fonts/Satoshi-Regular.otf"),
    "Satoshi-Italic": require("../assets/fonts/Satoshi-Italic.otf"),
    "Satoshi-Medium": require("../assets/fonts/Satoshi-Medium.otf"),
    "Satoshi-MediumItalic": require("../assets/fonts/Satoshi-MediumItalic.otf"),
    "Satoshi-Bold": require("../assets/fonts/Satoshi-Bold.otf"),
    "Satoshi-BoldItalic": require("../assets/fonts/Satoshi-BoldItalic.otf"),
    "Satoshi-Black": require("../assets/fonts/Satoshi-Black.otf"),
    "Satoshi-BlackItalic": require("../assets/fonts/Satoshi-BlackItalic.otf"),
  });

  // Cache le splash screen une fois les polices chargées
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore l'erreur si le splash screen n'est pas disponible
      });
    }
  }, [loaded]);

  // Affiche rien tant que les polices ne sont pas chargées
  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <WalletProvider>
        <View className="flex-1 bg-primary">
          <Stack
            initialRouteName="welcome"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#121418" },
            }}
          >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="sign_up" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="light" />
        </View>
        <WalletConnectModal projectId={projectId} providerMetadata={providerMetadata} />
      </WalletProvider>
    </SafeAreaProvider>
  );
}
