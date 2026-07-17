import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Button,
  Card,
  EmptyState,
  ErrorNote,
  KeyValueRow,
  Screen,
  SectionLabel,
  StatTile,
} from "../../components/ui";
import { DelegationCard } from "../../components/DelegationCard";
import { DevSignerBanner } from "../../components/DevSignerBadge";
import { api } from "../../lib/api/client";
import type { Delegation, OrderList, SideWallet } from "../../lib/api/types";
import { useAuth } from "../../lib/auth/AuthContext";
import { toError } from "../../lib/errors";
import {
  explorerAddressUrl,
  formatSignedSol,
  formatSol,
  truncateAddress,
} from "../../lib/format";
import { colors } from "../../lib/theme";

interface QuickAction {
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Copy trading", hint: "Copier un trader", icon: "people-outline", route: "/copytrade" },
  { label: "Sniping", hint: "Bot nouveau token", icon: "flash-outline", route: "/sniping" },
  { label: "Ordres", hint: "Suivi & historique", icon: "receipt-outline", route: "/orders" },
];

export default function DashboardScreen() {
  const { walletAddress, isDevSigner, adapter, logout } = useAuth();
  const router = useRouter();

  const [sideWallet, setSideWallet] = useState<SideWallet | null>(null);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [stats, setStats] = useState<OrderList | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [airdropping, setAirdropping] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [side, dels, orders] = await Promise.all([
        api.sideWallet().catch(() => null),
        api.listDelegations(),
        api.listOrders(),
      ]);
      setSideWallet(side);
      setDelegations(dels);
      setStats(orders);
    } catch (err) {
      setError(toError(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRevoke(id: string) {
    setRevokingId(id);
    setError(null);
    try {
      const prepared = await api.revokeDelegation(id);
      // Le backend a déjà coupé l'usage (fail-safe) ; on diffuse la révocation on-chain.
      await adapter.signAndSendTransaction(prepared.unsigned_tx);
      await load();
    } catch (err) {
      setError(toError(err));
    } finally {
      setRevokingId(null);
    }
  }

  async function onAirdrop() {
    if (!adapter.requestAirdrop) return;
    setAirdropping(true);
    setError(null);
    try {
      await adapter.requestAirdrop(1_000_000_000);
    } catch (err) {
      setError(toError(err));
    } finally {
      setAirdropping(false);
    }
  }

  const active = delegations.filter((d) => d.status === "active" || d.status === "pending");

  return (
    <Screen
      title="Tableau de bord"
      subtitle={truncateAddress(walletAddress, 6, 6)}
      refreshing={refreshing}
      onRefresh={load}
      rightElement={
        <Button title="Quitter" variant="ghost" size="sm" onPress={logout} />
      }
    >
      {isDevSigner ? <DevSignerBanner /> : null}
      {error ? <ErrorNote message={error.message} code={error.code} className="mt-3" /> : null}

      <View className="flex-row gap-3 mt-4">
        <StatTile
          label="PnL agrégé"
          value={formatSignedSol(stats?.aggregate_pnl ?? 0)}
          tone={(stats?.aggregate_pnl ?? 0) < 0 ? "danger" : "primary"}
        />
        <StatTile label="Réussis" value={String(stats?.success_count ?? 0)} />
        <StatTile label="Échoués" value={String(stats?.failed_count ?? 0)} />
      </View>

      <SectionLabel className="mt-7">Side wallet (délégataire)</SectionLabel>
      <Card>
        {sideWallet ? (
          <>
            <KeyValueRow
              label="Adresse"
              value={truncateAddress(sideWallet.pubkey, 6, 6)}
              onPressValue={() => Linking.openURL(explorerAddressUrl(sideWallet.pubkey))}
            />
            <KeyValueRow label="Solde" value={formatSol(sideWallet.balance_lamports)} />
            <KeyValueRow label="Réseau" value={sideWallet.network} />
          </>
        ) : (
          <EmptyState
            title="Side wallet non configuré"
            hint="Lance `python services/api/scripts/gen_side_wallet.py` puis renseigne SIDE_WALLET_SECRET_KEY."
          />
        )}
        {isDevSigner && adapter.requestAirdrop ? (
          <Button
            title="Airdrop 1 SOL sur ma clé de test"
            variant="secondary"
            size="sm"
            loading={airdropping}
            onPress={onAirdrop}
            className="mt-3 self-start"
          />
        ) : null}
      </Card>

      <View className="flex-row items-center justify-between mt-7 mb-2.5">
        <Text className="text-content-muted text-[12px] font-semibold uppercase tracking-wide">
          Délégations
        </Text>
        <Pressable onPress={() => router.push("/delegate")} className="flex-row items-center">
          <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
          <Text className="text-primary text-[13px] font-semibold ml-1">Nouvelle</Text>
        </Pressable>
      </View>
      {active.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucune délégation active"
            hint="Créez une session Degen ou Full Trust pour laisser le backend exécuter dans vos limites."
          />
        </Card>
      ) : (
        active.map((d) => (
          <DelegationCard
            key={d.id}
            delegation={d}
            onRevoke={onRevoke}
            revoking={revokingId === d.id}
          />
        ))
      )}

      <SectionLabel className="mt-7">Modes d'exécution</SectionLabel>
      {QUICK_ACTIONS.map((a) => (
        <Pressable key={a.route} onPress={() => router.push(a.route)}>
          <Card className="mb-3 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-surface-2 items-center justify-center mr-3.5">
              <Ionicons name={a.icon} size={19} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-content text-[15px] font-semibold">{a.label}</Text>
              <Text className="text-content-secondary text-[13px] mt-0.5">{a.hint}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
