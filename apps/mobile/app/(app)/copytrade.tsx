import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useFocusEffect } from "expo-router";

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
  SelectChip,
  SuccessNote,
} from "../../components/ui";
import { api } from "../../lib/api/client";
import type { CopyConfig, Delegation, Order, Trader } from "../../lib/api/types";
import { useAuth } from "../../lib/auth/AuthContext";
import { toError } from "../../lib/errors";
import {
  explorerTxUrl,
  formatSol,
  parseWhitelist,
  solToLamports,
  truncateAddress,
} from "../../lib/format";

const MODE_LABEL: Record<string, string> = { degen: "Degen", full_trust: "Full Trust" };

export default function CopytradeScreen() {
  const { adapter } = useAuth();

  const [traders, setTraders] = useState<Trader[]>([]);
  const [configs, setConfigs] = useState<CopyConfig[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const [traderId, setTraderId] = useState<string | null>(null);
  const [position, setPosition] = useState("0.1");
  const [budget, setBudget] = useState("1");
  const [slippage, setSlippage] = useState("100");
  const [whitelist, setWhitelist] = useState("");
  const [delegationId, setDelegationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [execId, setExecId] = useState<string | null>(null);
  const [execResult, setExecResult] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [t, c, d] = await Promise.all([
        api.listTraders(),
        api.listCopyConfigs(),
        api.listDelegations(),
      ]);
      setTraders(t);
      setConfigs(c);
      setDelegations(d.filter((x) => x.status === "active"));
      if (!traderId && t.length) setTraderId(t[0].id);
    } catch (err) {
      setError(toError(err));
    } finally {
      setRefreshing(false);
    }
  }, [traderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onSave() {
    if (!traderId) {
      setError({ message: "Sélectionnez un trader" });
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.upsertCopyConfig({
        trader_id: traderId,
        position_size: solToLamports(parseFloat(position) || 0),
        max_budget: solToLamports(parseFloat(budget) || 0),
        slippage_bps: parseInt(slippage, 10) || 100,
        token_whitelist: parseWhitelist(whitelist),
        delegation_id: delegationId,
        enabled: true,
      });
      setSaved(true);
      await load();
    } catch (err) {
      setError(toError(err));
    } finally {
      setSaving(false);
    }
  }

  async function onExecute(cfg: CopyConfig) {
    setExecId(cfg.id);
    setError(null);
    setExecResult(null);
    try {
      let order = await api.executeCopy(cfg.id);
      // Mode manuel → l'utilisateur signe puis le backend diffuse.
      if (order.status === "ready_to_sign" && order.mode === "manual" && order.unsigned_tx) {
        const signed = await adapter.signTransaction(order.unsigned_tx);
        order = await api.submitOrder(order.id, signed);
      }
      setExecResult(order);
    } catch (err) {
      setError(toError(err));
    } finally {
      setExecId(null);
    }
  }

  return (
    <Screen
      title="Copy trading"
      subtitle="Copier un trader dans vos limites"
      refreshing={refreshing}
      onRefresh={load}
    >
      <SectionLabel className="mt-1">Trader à copier</SectionLabel>
      {traders.map((t) => {
        const selected = traderId === t.id;
        const winRate = typeof t.stats.win_rate === "number" ? t.stats.win_rate : null;
        return (
          <Pressable key={t.id} onPress={() => setTraderId(t.id)}>
            <Card className={`mb-2.5 ${selected ? "border-primary" : ""}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-content text-[15px] font-semibold">{t.label}</Text>
                  <Text className="text-content-muted text-[12px] mt-0.5">
                    {truncateAddress(t.wallet_address, 6, 6)}
                  </Text>
                </View>
                {winRate != null ? (
                  <Badge label={`${Math.round(winRate * 100)}% win`} tone="info" />
                ) : null}
              </View>
            </Card>
          </Pressable>
        );
      })}

      <SectionLabel className="mt-6">Paramètres</SectionLabel>
      <Card>
        <View className="flex-row gap-3">
          <Input label="Taille position" value={position} onChangeText={setPosition} keyboardType="decimal-pad" suffix="SOL" className="flex-1" />
          <Input label="Budget max" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" suffix="SOL" className="flex-1" />
        </View>
        <View className="h-3" />
        <Input label="Slippage" value={slippage} onChangeText={setSlippage} keyboardType="numeric" suffix="bps" />
        <View className="h-3" />
        <Input
          label="Whitelist tokens"
          value={whitelist}
          onChangeText={setWhitelist}
          placeholder="mints séparés par des virgules"
          helper="Laisser vide = wSOL + USDC (whitelist par défaut)"
          multiline
        />

        <Text className="text-content-secondary text-[13px] font-medium mt-4 mb-2">
          Exécution
        </Text>
        <View className="flex-row flex-wrap">
          <SelectChip label="Manuel (je signe)" selected={delegationId === null} onPress={() => setDelegationId(null)} />
          {delegations.map((d) => (
            <SelectChip
              key={d.id}
              label={`${MODE_LABEL[d.mode] ?? d.mode} · ${formatSol(d.amount_max, 2)}`}
              selected={delegationId === d.id}
              onPress={() => setDelegationId(d.id)}
            />
          ))}
        </View>
        {delegations.length === 0 ? (
          <Text className="text-content-muted text-[12px] mt-1">
            Aucune délégation active — le copy trade se fera en mode manuel.
          </Text>
        ) : null}

        {error ? <ErrorNote message={error.message} code={error.code} className="mt-4" /> : null}
        {saved ? (
          <SuccessNote className="mt-4">
            <Text className="text-primary text-[13px] font-semibold">Configuration enregistrée</Text>
          </SuccessNote>
        ) : null}
        <Button title="Enregistrer la configuration" onPress={onSave} loading={saving} fullWidth className="mt-4" />
      </Card>

      <SectionLabel className="mt-7">Mes copies</SectionLabel>
      {configs.length === 0 ? (
        <Card>
          <EmptyState title="Aucune configuration" hint="Enregistrez une configuration ci-dessus pour commencer." />
        </Card>
      ) : (
        configs.map((c) => {
          const trader = traders.find((t) => t.id === c.trader_id);
          return (
            <Card key={c.id} className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-content text-[15px] font-semibold">
                  {trader?.label ?? truncateAddress(c.trader_id, 4, 4)}
                </Text>
                <Badge
                  label={c.delegation_id ? "délégué" : "manuel"}
                  tone={c.delegation_id ? "primary" : "neutral"}
                />
              </View>
              <KeyValueRow label="Position" value={formatSol(c.position_size)} />
              <KeyValueRow label="Budget" value={formatSol(c.max_budget)} />
              <KeyValueRow label="Slippage" value={`${c.slippage_bps} bps`} />
              {execResult && execId === null ? null : null}
              <Button
                title="Simuler un trade copié"
                variant="secondary"
                size="sm"
                loading={execId === c.id}
                onPress={() => onExecute(c)}
                className="mt-3 self-start"
              />
            </Card>
          );
        })
      )}

      {execResult ? (
        <SuccessNote className="mt-2">
          <Text className="text-primary text-[13px] font-semibold">
            Ordre {execResult.status} · {formatSol(execResult.input_amount)}
          </Text>
          {execResult.tx_signature ? (
            <Text
              className="text-info text-[12px] underline mt-1"
              onPress={() => Linking.openURL(explorerTxUrl(execResult.tx_signature!))}
            >
              {truncateAddress(execResult.tx_signature, 8, 8)} — explorer
            </Text>
          ) : null}
        </SuccessNote>
      ) : null}
    </Screen>
  );
}
