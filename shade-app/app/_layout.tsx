// Polyfill d'entropie : fournit crypto.getRandomValues sur React Native,
// requis par tweetnacl (génération de clés Phantom). À garder en tout premier.
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import "text-encoding";
import { Buffer } from "buffer";
import { BackHandler } from "react-native";
global.Buffer = Buffer;

// Polyfill pour BackHandler.removeEventListener (déprécié dans RN ≥ 0.74).
if (BackHandler && !(BackHandler as any).removeEventListener) {
  (BackHandler as any).removeEventListener = () => {};
}

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WalletConnectModal } from "@walletconnect/modal-react-native";
import "../global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { WalletProvider } from "@/lib/wallet-store";
import { logger } from "@/lib/logger";

/**
 * Identifiant de projet WalletConnect (cloud.walletconnect.com / reown).
 * `EXPO_PUBLIC_REOWN_PROJECT_ID` est conservé en fallback pour ne pas casser
 * les .env existants.
 */
const WALLETCONNECT_PROJECT_ID =
  process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.EXPO_PUBLIC_REOWN_PROJECT_ID ||
  "";

// WalletConnect embarque des modules natifs absents d'Expo Go : ces logs sont
// inoffensifs (le wallet EVM sera finalisé via un build natif). On les masque
// pour garder la console propre, notamment en démo.
LogBox.ignoreLogs([
  "react-native-compat",
  "projectId not found",
  "Application module is not available",
]);

/** Métadonnées présentées aux wallets lors d'une connexion WalletConnect. */
const providerMetadata = {
  name: "Shade",
  description: "Copy trading & sniping sur Solana",
  url: "https://shade.app",
  icons: ["https://shade.app/icon.png"],
  redirect: {
    native: "shadeapp://",
    universal: "https://shade.app",
  },
};

// Empêche le splash screen de se cacher automatiquement.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Layout racine de l'application
 * Gère le chargement des polices, le contexte wallet et la navigation globale.
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
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  // Avertit si la connexion WalletConnect n'est pas configurée
  useEffect(() => {
    if (!WALLETCONNECT_PROJECT_ID) {
      logger.warn(
        "EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID manquant : la connexion EVM (WalletConnect) restera indisponible."
      );
    }
  }, []);

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
        {WALLETCONNECT_PROJECT_ID ? (
          <WalletConnectModal
            projectId={WALLETCONNECT_PROJECT_ID}
            providerMetadata={providerMetadata}
          />
        ) : null}
      </WalletProvider>
    </SafeAreaProvider>
  );
}
