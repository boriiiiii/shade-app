import React, { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, ErrorNote } from "../../components/ui";
import { DevSignerBadge } from "../../components/DevSignerBadge";
import { useAuth } from "../../lib/auth/AuthContext";
import { toError } from "../../lib/errors";
import { colors } from "../../lib/theme";

const PRINCIPLES = [
  {
    icon: "key-outline" as const,
    title: "Votre clé reste à vous",
    body: "Shade ne voit ni ne stocke jamais votre clé privée. Vous prouvez la possession du wallet en signant un message.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Délégation limitée et révocable",
    body: "Vous approuvez un montant précis d'un token précis (SPL Approve). Révocable on-chain à tout moment.",
  },
  {
    icon: "lock-closed-outline" as const,
    title: "Fonds isolés",
    body: "Le side wallet ne peut dépenser que ce que vous approuvez. Le reste de vos fonds est hors de portée.",
  },
] as const;

export default function ConnectScreen() {
  const { login, isDevSigner } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  async function onConnect() {
    setError(null);
    setLoading(true);
    try {
      await login();
      // Navigation is handled by the root guard once status flips to authenticated.
    } catch (err) {
      setError(toError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      className="flex-1 bg-background px-6"
      style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-1">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-2xl bg-primary-soft items-center justify-center">
            <Ionicons name="moon" size={22} color={colors.primary} />
          </View>
          {isDevSigner ? <DevSignerBadge className="ml-3" /> : null}
        </View>

        <Text className="text-content text-[34px] font-bold tracking-tight mt-8">
          Shade
        </Text>
        <Text className="text-content-secondary text-[16px] leading-6 mt-2">
          Copy trading et sniping automatisés sur Solana — sans jamais céder votre
          clé privée.
        </Text>

        <View className="mt-9">
          {PRINCIPLES.map((p) => (
            <Card key={p.title} className="mb-3 flex-row">
              <View className="w-9 h-9 rounded-xl bg-surface-2 items-center justify-center mr-3.5">
                <Ionicons name={p.icon} size={18} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-content text-[15px] font-semibold">
                  {p.title}
                </Text>
                <Text className="text-content-secondary text-[13px] leading-5 mt-1">
                  {p.body}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View>
        {error ? <ErrorNote message={error.message} code={error.code} className="mb-3" /> : null}
        <Button
          title={isDevSigner ? "Connecter le wallet (dev)" : "Connecter le wallet"}
          onPress={onConnect}
          loading={loading}
          fullWidth
          iconLeft={
            <Ionicons name="wallet-outline" size={18} color={colors.background} />
          }
        />
        <Text className="text-content-muted text-[12px] text-center mt-3 leading-4">
          {isDevSigner
            ? "Une clé de test locale sera générée et financée sur devnet."
            : "Vous serez redirigé vers Phantom pour signer le message de connexion."}
        </Text>
      </View>
    </View>
  );
}
