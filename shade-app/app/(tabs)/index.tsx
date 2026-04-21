import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useState, useEffect } from "react";
import { getApiStatus, ApiData } from "@/lib/api";
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { getSolBalance, getEthBalance, shortenAddress } from "@/lib/crypto";
import { useWallet } from "@/lib/wallet-store";

/**
 * Page d'accueil principale de l'application (avec bottom navigation)
 */
export default function HomeScreen() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useWalletConnectModal();
  const { phantomAddress, evmAddress } = useWallet();
  
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const activeAddress = phantomAddress || evmAddress || (isConnected ? address : null);
  const isWalletConnected = !!activeAddress;

  // Récupère les données de l'API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getApiStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (activeAddress) {
        setBalanceLoading(true);
        
        if (phantomAddress) {
            const solBal = await getSolBalance(phantomAddress);
            setBalance(`${solBal} SOL`);
        } else if (evmAddress) {
            const ethBal = await getEthBalance(evmAddress);
            setBalance(`${ethBal} ETH`);
        } else if (isConnected && address) {
             // Fallback for WalletConnect
            const solBal = await getSolBalance(address);
            if (solBal !== '0.0') {
                setBalance(`${solBal} SOL`);
            } else {
                const ethBal = await getEthBalance(address);
                setBalance(`${ethBal} ETH`);
            }
        }
        setBalanceLoading(false);
      } else {
        setBalance(null);
      }
    };
    
    fetchWalletBalance();
  }, [activeAddress, phantomAddress, evmAddress, isConnected, address]);

  const handleLogout = () => {
    router.replace("/welcome");
  };

  return (
    <View className="flex-1 items-center justify-center bg-primary p-md">
      <Text className="text-xl font-bold text-text-primary mb-xl">
        Shade App
      </Text>

      {/* Wallet Status Card */}
      {isWalletConnected && activeAddress && (
        <View className="w-full max-w-md mb-md bg-cards rounded-md p-lg">
          <Text className="text-lg font-bold mb-sm text-text-primary">Wallet Connected</Text>
          <View className="flex-row justify-between items-center mb-sm">
            <Text className="text-text-secondary">Address:</Text>
            <Text className="text-text-primary font-satoshi">{shortenAddress(activeAddress)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary">Balance:</Text>
            {balanceLoading ? (
                <ActivityIndicator size="small" color="#6283FA" />
            ) : (
                <Text className="text-text-primary font-bold">{balance || '0.00'}</Text>
            )}
          </View>
        </View>
      )}

      {/* Chargement */}
      {loading && (
        <View className="mb-md">
          <ActivityIndicator size="large" color="#6283FA" />
          <Text className="text-text-secondary mt-sm">Chargement...</Text>
        </View>
      )}

      {/* Erreur */}
      {error && !loading && (
        <View className="bg-cards p-md rounded-md mb-md">
          <Text className="text-invalidation font-semibold">Erreur: {error}</Text>
          <Pressable className="bg-invalidation px-md py-sm rounded-sm mt-sm" onPress={fetchData}>
            <Text className="text-text-primary text-center">Réessayer</Text>
          </Pressable>
        </View>
      )}

      {/* Données */}
      {data && !loading && (
        <View className="w-full max-w-md mb-md">
          <View className="bg-cards rounded-md p-lg">
            <Text className="text-lg font-bold mb-md text-text-primary">API Status</Text>
            <Text className="text-text-secondary">Message: {data.hello}</Text>
            <Text className="text-text-secondary mt-sm">
              Supabase: {data.supabase_configured ? "✅ Configuré" : "❌ Non configuré"}
            </Text>
          </View>

          <Pressable className="bg-secondary px-lg py-md rounded-md mt-md" onPress={fetchData}>
            <Text className="text-text-primary font-semibold text-center">🔄 Rafraîchir</Text>
          </Pressable>
        </View>
      )}

      {/* Déconnexion */}
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
  );
}
