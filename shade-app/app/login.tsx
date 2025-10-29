import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import {
  BackIcon,
  Coinbase,
  Metamask,
  Binance,
  Phantom,
} from "@/components/icons";
import { WalletButton } from "@/components/wallet-button";
import { logger } from "@/lib/logger";
import { LAYOUT } from "@/lib/constants";

/**
 * Page de connexion via wallet
 * Permet à l'utilisateur de se connecter en choisissant son portefeuille crypto
 */
export default function Login() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Gère la connexion à un wallet spécifique
   * TODO: Implémenter l'intégration réelle des wallets (WalletConnect, etc.)
   * @param walletName - Nom du wallet sélectionné (Coinbase, Metamask, etc.)
   */
  const handleWalletConnect = (walletName: string) => {
    logger.info("Wallet connection initiated", { walletName });
    
    // TODO: Implémenter la vraie logique de connexion ici
    // try {
    //   await connectWallet(walletName);
    //   logger.info("Wallet connected successfully", { walletName });
    // } catch (error) {
    //   logger.error("Wallet connection failed", { walletName, error });
    //   return;
    // }
    
    // Redirection vers l'app après connexion réussie
    router.push("/(tabs)");
  };

  return (
    <View className="flex-1 px-[21px] pb-[21px] pt-[60px] bg-primary">
      <View className="flex-1 bg-primary">
        <View className="flex-1">
          <View className="flex-row items-center relative">
            <TouchableOpacity onPress={handleGoBack}>
              <BackIcon width={20} height={20} />
            </TouchableOpacity>
            <View className="absolute left-0 right-0 items-center">
              <Text className="text-text-secondary font-satoshi text-xl">
                Login
              </Text>
            </View>
          </View>
          <View
            className="justify-center items-center"
            style={{ marginTop: LAYOUT.walletListTopMargin }}
          >
            <Text className="text-white font-satoshi text-3xl">
              Connect with your wallet
            </Text>
            <Text className="text-text-secondary font-satoshi font-light mt-[16px] mb-[40px] text-xl">
              you can connect more later
            </Text>
            <View className="w-full items-center">
              <WalletButton
                name="Coinbase"
                Icon={Coinbase}
                onPress={() => handleWalletConnect("Coinbase")}
                isFirst
              />
              <WalletButton
                name="Metamask"
                Icon={Metamask}
                onPress={() => handleWalletConnect("Metamask")}
              />
              <WalletButton
                name="Binance"
                Icon={Binance}
                onPress={() => handleWalletConnect("Binance")}
              />
              <WalletButton
                name="Phantom"
                Icon={Phantom}
                onPress={() => handleWalletConnect("Phantom")}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
