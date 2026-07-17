import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../lib/theme";
import { cn } from "./ui/cn";

/**
 * Highly visible marker that the app is running with the LOCAL DEV SIGNER
 * (a test key), not a real non-custodial wallet. Never shown in production builds.
 */
export function DevSignerBadge({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        "flex-row items-center self-start rounded-full border border-warning/50 bg-warning-soft px-2.5 py-1",
        className,
      )}
    >
      <Ionicons name="flask" size={12} color={colors.warning} />
      <Text className="text-warning text-[11px] font-bold uppercase tracking-wide ml-1.5">
        Dev Signer
      </Text>
    </View>
  );
}

export function DevSignerBanner() {
  return (
    <View className="flex-row items-center rounded-xl border border-warning/40 bg-warning-soft px-3.5 py-3">
      <Ionicons name="warning-outline" size={18} color={colors.warning} />
      <Text className="text-warning text-[12px] leading-4 ml-2.5 flex-1">
        Signer de développement actif — clé de test locale (devnet). Le chemin de
        production utilise Phantom et ne détient jamais votre clé privée.
      </Text>
    </View>
  );
}
