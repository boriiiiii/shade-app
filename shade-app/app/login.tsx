import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import {
  BackIcon,
  Coinbase,
  Metamask,
  Binance,
  Phantom,
} from "@/components/icons";
import { WalletButton } from "@/components/ui/wallet-button";
import { logger } from "@/lib/logger";
import { LAYOUT } from "@/lib/constants";
import { connectPhantom, handlePhantomRedirect } from "@/lib/phantom";
import { useWallet } from "@/lib/wallet-store";
import * as Linking from 'expo-linking';
import nacl from 'tweetnacl';

import { useWalletConnectModal } from '@walletconnect/modal-react-native';

/**
 * Page de connexion via wallet
 * Permet à l'utilisateur de se connecter en choisissant son portefeuille crypto
 */
export default function Login() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [dappKeyPair, setDappKeyPair] = useState<nacl.BoxKeyPair | null>(null);
  const { connectPhantom: savePhantomConnection, connectEVM: saveEVMConnection } = useWallet();

  const handleGoBack = () => {
    router.back();
  };

  const { open, isConnected, address, provider } = useWalletConnectModal();

  // Redirection automatique une fois connecté via WalletConnect
  useEffect(() => {
    if (isConnected && address) {
      logger.info("Wallet connected successfully (EVM)", { address, walletType: 'EVM' });
      saveEVMConnection(address);
      router.replace("/(tabs)");
    }
  }, [isConnected, address]);

  // Handle Phantom Deep Links
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      if (dappKeyPair && event.url.includes('phantom_encryption_public_key')) {
        logger.info('Phantom redirect received:', { url: event.url });
        try {
          const data = handlePhantomRedirect(event.url, dappKeyPair);
          logger.info('Phantom data decrypted:', { success: !!data });
          if (data?.publicKey && dappKeyPair) {
            logger.info("Phantom connected successfully", { address: data.publicKey });
            savePhantomConnection(data.publicKey, data.session, data.sharedSecret, dappKeyPair.publicKey);
            router.replace("/(tabs)");
          }
        } catch (e) {
          logger.error('Phantom connection error:', { error: e });
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [dappKeyPair]);

  /**
   * Gère la connexion à un wallet spécifique
   * Pour Phantom: ouvre l'app Phantom via deep link
   * Pour les autres: ouvre le modal WalletConnect
   * @param walletName - Nom du wallet sélectionné (Coinbase, Metamask, etc.)
   */
  const handleWalletConnect = async (walletName: string) => {
    if (isConnecting) {
      logger.info("Connection already in progress");
      return;
    }

    if (walletName === 'Phantom') {
        try {
            setIsConnecting(true);
            const keyPair = await connectPhantom();
            setDappKeyPair(keyPair);
        } catch (error) {
            logger.error("Error connecting to Phantom", { error });
            setIsConnecting(false);
        }
        return;
    }

    // Pour tous les wallets EVM (Metamask, Coinbase, Binance)
    try {
      setIsConnecting(true);
      logger.info("Wallet connection initiated", { walletName });
      
      // Si déjà connecté, déconnecter d'abord
      if (isConnected) {
        await provider?.disconnect();
      }
      
      // Ouvrir le modal WalletConnect
      await open();
    } catch (error) {
      logger.error("Error opening wallet modal", { error });
    } finally {
      // Reset après un délai pour éviter les doubles clics rapides
      setTimeout(() => setIsConnecting(false), 1000);
    }
  };

  return (
    <View className="flex-1 px-[21px] pb-[21px] pt-[60px] bg-primary">
      <View className="flex-1 bg-primary">
        <View className="flex-1">
          <View className="flex-row items-center relative mt-5">
            <TouchableOpacity onPress={handleGoBack}>
              <BackIcon width={20} height={20} />
            </TouchableOpacity>
            <View className="absolute left-0 right-0 items-center">
              <Text className="text-text-secondary font-satoshi text-2xl">
                Login
              </Text>
            </View>
          </View>
          <View
            className="justify-center items-center"
            style={{ marginTop: LAYOUT.walletListTopMargin }}
          >
            <Text className="text-text-primary font-satoshi text-3xl">
              Connect with your wallet
            </Text>
            <Text className="text-text-secondary font-satoshi font-light mt-[16px] mb-[40px] text-xl">
              you can connect more later
            </Text>
            <View className="w-full items-center">
              <WalletButton
                name="Binance"
                Icon={Binance}
                onPress={() => handleWalletConnect("Binance")}
                isFirst
              />
              <WalletButton
                name="Coinbase"
                Icon={Coinbase}
                onPress={() => handleWalletConnect("Coinbase")}
              />
              <WalletButton
                name="Metamask"
                Icon={Metamask}
                onPress={() => handleWalletConnect("Metamask")}
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
