import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useState, useEffect } from "react";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";
import { getSolBalance, getEthBalance, getPolygonBalance, shortenAddress } from "@/lib/crypto";
import { useWallet } from "@/lib/wallet-store";
import { Solana, Ethereum, Phantom } from "@/components/icons";
import { logger } from "@/lib/logger";
import { Dimensions } from "react-native";

const { height: screenHeight } = Dimensions.get("window");

interface ChainBalance {
  id: string;
  name: string;
  symbol: string;
  balance: string | null;
  loading: boolean;
  Icon: React.FC<{ width?: number; height?: number }>;
}

const INITIAL_BALANCES: ChainBalance[] = [
  { id: "sol",   name: "Solana",   symbol: "SOL",   balance: null, loading: false, Icon: Solana },
  { id: "eth",   name: "Ethereum", symbol: "ETH",   balance: null, loading: false, Icon: Ethereum },
  { id: "matic", name: "Polygon",  symbol: "MATIC", balance: null, loading: false, Icon: Ethereum },
];

export default function PortfolioScreen() {
  const { address, isConnected } = useWalletConnectModal();
  const { phantomAddress, evmAddress } = useWallet();
  const [balances, setBalances] = useState<ChainBalance[]>(INITIAL_BALANCES);

  const evmActive = evmAddress || (isConnected && address && !phantomAddress ? address : null);
  const activeAddress = phantomAddress || evmActive;

  const setChainLoading = (id: string, loading: boolean) => {
    setBalances(prev => prev.map(b => b.id === id ? { ...b, loading } : b));
  };

  const setChainBalance = (id: string, balance: string) => {
    setBalances(prev => prev.map(b => b.id === id ? { ...b, balance, loading: false } : b));
  };

  useEffect(() => {
    if (!activeAddress) return;

    const fetchAll = async () => {
      const fetches: Promise<void>[] = [];

      if (phantomAddress) {
        setChainLoading("sol", true);
        fetches.push(
          getSolBalance(phantomAddress).then(bal => setChainBalance("sol", bal))
        );
      }

      if (evmActive) {
        setChainLoading("eth", true);
        setChainLoading("matic", true);
        fetches.push(
          getEthBalance(evmActive).then(bal => setChainBalance("eth", bal)),
          getPolygonBalance(evmActive).then(bal => setChainBalance("matic", bal))
        );
      }

      try {
        await Promise.all(fetches);
      } catch (e) {
        logger.error("Error fetching balances", { error: e });
      }
    };

    fetchAll();
  }, [phantomAddress, evmAddress, isConnected, address]);

  const visibleBalances = balances.filter(b => {
    if (b.id === "sol") return !!phantomAddress;
    return !!evmActive;
  });

  const handleLogout = () => {
    router.replace("/welcome");
  };

  return (
    <ScrollView
      className="flex-1 bg-primary"
      contentContainerStyle={{ paddingHorizontal: 21, paddingTop: screenHeight * 0.073, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-xl">
        <Text className="text-text-primary font-satoshi text-2xl font-bold">Portfolio</Text>
        <Pressable onPress={handleLogout} className="p-sm">
          <Feather name="log-out" size={20} color="#6B6B6B" />
        </Pressable>
      </View>

      {/* Wallet address card */}
      {activeAddress && (
        <View className="bg-cards rounded-lg p-lg mb-xl flex-row items-center justify-between">
          <View className="flex-row items-center gap-sm">
            <Phantom width={20} height={20} />
            <Text className="text-text-secondary font-satoshi text-sm">
              {shortenAddress(activeAddress, 6)}
            </Text>
          </View>
          <View className="bg-validation/20 px-sm py-xs rounded-sm">
            <Text className="text-validation text-xs font-satoshi">Connected</Text>
          </View>
        </View>
      )}

      {/* Assets */}
      {visibleBalances.length > 0 && (
        <>
          <Text className="text-text-muted font-satoshi text-sm mb-md uppercase tracking-widest">
            Assets
          </Text>
          <View className="gap-sm">
            {visibleBalances.map(chain => (
              <View key={chain.id} className="bg-cards rounded-lg p-lg flex-row items-center justify-between">
                <View className="flex-row items-center gap-md">
                  <View className="w-10 h-10 rounded-full bg-primary justify-center items-center">
                    <chain.Icon width={22} height={22} />
                  </View>
                  <View>
                    <Text className="text-text-primary font-satoshi font-medium">{chain.name}</Text>
                    <Text className="text-text-muted font-satoshi text-sm">{chain.symbol}</Text>
                  </View>
                </View>
                {chain.loading ? (
                  <ActivityIndicator size="small" color="#6283FA" />
                ) : (
                  <Text className="text-text-primary font-satoshi font-bold">
                    {chain.balance !== null
                      ? `${parseFloat(chain.balance).toFixed(4)} ${chain.symbol}`
                      : "—"}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {/* Empty state */}
      {!activeAddress && (
        <View className="flex-1 items-center justify-center mt-xl">
          <Text className="text-text-muted font-satoshi text-center">
            No wallet connected
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
