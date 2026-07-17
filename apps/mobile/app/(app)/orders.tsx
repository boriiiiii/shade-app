import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Input,
  KeyValueRow,
  Screen,
  SectionLabel,
  StatTile,
  SuccessNote,
  orderStatusTone,
} from "../../components/ui";
import { api } from "../../lib/api/client";
import type { Order, OrderList } from "../../lib/api/types";
import { useAuth } from "../../lib/auth/AuthContext";
import { toError } from "../../lib/errors";
import {
  explorerTxUrl,
  formatSol,
  solToLamports,
  truncateAddress,
} from "../../lib/format";
import { colors, MINTS } from "../../lib/theme";

const MODE_LABEL: Record<string, string> = {
  manual: "Manuel",
  degen: "Degen",
  full_trust: "Full Trust",
};

function mintLabel(mint: string): string {
  if (mint === MINTS.WSOL) return "wSOL";
  if (mint === MINTS.NATIVE_SOL_SENTINEL) return "SOL";
  if (mint === MINTS.USDC_DEVNET) return "USDC";
  return truncateAddress(mint, 4, 4);
}

export default function OrdersScreen() {
  const { adapter } = useAuth();

  const [data, setData] = useState<OrderList | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Formulaire d'ordre manuel (SOL → wSOL).
  const [amount, setAmount] = useState("0.1");
  const [slippage, setSlippage] = useState("100");
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      setData(await api.listOrders());
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

  async function createManualOrder() {
    const sol = parseFloat(amount);
    const bps = parseInt(slippage, 10);
    if (!Number.isFinite(sol) || sol <= 0) {
      setError({ message: "Montant invalide" });
      return;
    }
    setCreating(true);
    setError(null);
    setCreateResult(null);
    try {
      // prepare → validation + tx reconstruite serveur (SOL→wSOL).
      const order = await api.prepareOrder({
        mode: "manual",
        side: "buy",
        input_mint: MINTS.NATIVE_SOL_SENTINEL,
        output_mint: MINTS.WSOL,
        input_amount: solToLamports(sol),
        slippage_bps: Number.isFinite(bps) ? bps : 100,
      });
      // sign (wallet) → submit (le backend diffuse).
      if (!order.unsigned_tx) throw new Error("Transaction manquante");
      const signed = await adapter.signTransaction(order.unsigned_tx);
      const submitted = await api.submitOrder(order.id, signed);
      setCreateResult(submitted);
      await load();
    } catch (err) {
      setError(toError(err));
    } finally {
      setCreating(false);
    }
  }

  async function actOn(order: Order) {
    setBusyId(order.id);
    setError(null);
    try {
      if (order.status === "ready_to_sign" && order.mode === "manual") {
        if (!order.unsigned_tx) throw new Error("Transaction manquante");
        const signed = await adapter.signTransaction(order.unsigned_tx);
        await api.submitOrder(order.id, signed);
      } else if (order.status === "ready_to_sign") {
        await api.executeOrder(order.id);
      } else if (order.status === "pending") {
        await api.getOrder(order.id); // rafraîchit le statut on-chain côté backend
      }
      await load();
    } catch (err) {
      setError(toError(err));
    } finally {
      setBusyId(null);
    }
  }

  function actionLabel(order: Order): string | null {
    if (order.status === "ready_to_sign") {
      return order.mode === "manual" ? "Signer & envoyer" : "Exécuter (side wallet)";
    }
    if (order.status === "pending") return "Rafraîchir le statut";
    return null;
  }

  const orders = data?.orders ?? [];

  return (
    <Screen
      title="Ordres"
      subtitle="Préparés, validés et suivis côté serveur"
      refreshing={refreshing}
      onRefresh={load}
    >
      <View className="flex-row gap-3 mt-1">
        <StatTile label="Réussis" value={String(data?.success_count ?? 0)} tone="primary" />
        <StatTile label="Échoués" value={String(data?.failed_count ?? 0)} tone="danger" />
        <StatTile label="Total" value={String(orders.length)} />
      </View>

      <SectionLabel className="mt-7">Nouvel ordre manuel (SOL → wSOL)</SectionLabel>
      <Card>
        <View className="flex-row gap-3">
          <Input
            label="Montant"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            suffix="SOL"
            className="flex-1"
          />
          <Input
            label="Slippage"
            value={slippage}
            onChangeText={setSlippage}
            keyboardType="numeric"
            suffix="bps"
            className="flex-1"
          />
        </View>
        {createResult ? (
          <SuccessNote className="mt-4">
            <Text className="text-primary text-[13px] font-semibold">
              Ordre {createResult.status}
            </Text>
            {createResult.tx_signature ? (
              <Text
                className="text-info text-[12px] underline mt-1"
                onPress={() => Linking.openURL(explorerTxUrl(createResult.tx_signature!))}
              >
                {truncateAddress(createResult.tx_signature, 8, 8)} — explorer
              </Text>
            ) : null}
          </SuccessNote>
        ) : null}
        <Button
          title="Préparer & signer"
          onPress={createManualOrder}
          loading={creating}
          fullWidth
          className="mt-4"
        />
      </Card>

      {error ? <ErrorNote message={error.message} code={error.code} className="mt-4" /> : null}

      <SectionLabel className="mt-7">Historique</SectionLabel>
      {orders.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucun ordre"
            hint="Créez un ordre manuel ci-dessus, ou déclenchez un copy trade / snipe."
          />
        </Card>
      ) : (
        orders.map((o) => {
          const expanded = expandedId === o.id;
          const label = actionLabel(o);
          return (
            <Card key={o.id} className="mb-3">
              <Pressable onPress={() => setExpandedId(expanded ? null : o.id)}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Badge label={MODE_LABEL[o.mode] ?? o.mode} tone="neutral" />
                    <Text className="text-content text-[14px] font-semibold ml-2">
                      {mintLabel(o.input_mint)} → {mintLabel(o.output_mint)}
                    </Text>
                  </View>
                  <Badge label={o.status} tone={orderStatusTone(o.status)} dot />
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-content-secondary text-[13px]">
                    {formatSol(o.input_amount)} · {o.source}
                  </Text>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.textMuted}
                  />
                </View>
              </Pressable>

              {expanded ? (
                <View className="mt-2 border-t border-border pt-1">
                  <KeyValueRow label="Slippage" value={`${o.slippage_bps} bps`} />
                  {o.min_output_amount != null ? (
                    <KeyValueRow label="Min. sortie" value={String(o.min_output_amount)} />
                  ) : null}
                  {o.tx_signature ? (
                    <KeyValueRow
                      label="Transaction"
                      value={truncateAddress(o.tx_signature, 6, 6)}
                      onPressValue={() => Linking.openURL(explorerTxUrl(o.tx_signature!))}
                    />
                  ) : null}
                  {o.failure_reason ? (
                    <ErrorNote message={o.failure_reason} className="mt-2" />
                  ) : null}
                  {label ? (
                    <Button
                      title={label}
                      size="sm"
                      variant={o.status === "pending" ? "secondary" : "primary"}
                      loading={busyId === o.id}
                      onPress={() => actOn(o)}
                      className="mt-3 self-start"
                    />
                  ) : null}
                </View>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
