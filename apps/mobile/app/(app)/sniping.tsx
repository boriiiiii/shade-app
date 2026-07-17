import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useFocusEffect } from "expo-router";

import {
  Badge,
  Button,
  Card,
  ErrorNote,
  Input,
  Screen,
  SectionLabel,
  SelectChip,
  SuccessNote,
} from "../../components/ui";
import { ApiError } from "../../lib/api/client";
import { api } from "../../lib/api/client";
import type { Delegation, Order, SnipeConfig } from "../../lib/api/types";
import { useAuth } from "../../lib/auth/AuthContext";
import { toError } from "../../lib/errors";
import {
  explorerTxUrl,
  formatSol,
  parseWhitelist,
  solToLamports,
  truncateAddress,
} from "../../lib/format";
import { MINTS } from "../../lib/theme";

export default function SnipingScreen() {
  const { adapter } = useAuth();

  const [config, setConfig] = useState<SnipeConfig | null>(null);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const [maxPosition, setMaxPosition] = useState("0.2");
  const [slippage, setSlippage] = useState("200");
  const [latency, setLatency] = useState("5000");
  const [whitelist, setWhitelist] = useState("");
  const [delegationId, setDelegationId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [mint, setMint] = useState<string>(MINTS.USDC_DEVNET);
  const [eventLatency, setEventLatency] = useState("800");
  const [sniping, setSniping] = useState(false);
  const [snipeResult, setSnipeResult] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const dels = await api.listDelegations();
      const fullTrust = dels.filter((d) => d.status === "active" && d.mode === "full_trust");
      setDelegations(fullTrust);

      const cfg = await api.getSnipeConfig().catch((e) => {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      });
      setConfig(cfg);
      if (cfg) {
        setMaxPosition(formatSol(cfg.max_position, 4).replace(" SOL", ""));
        setSlippage(String(cfg.slippage_bps));
        setLatency(String(cfg.max_latency_ms));
        setWhitelist((cfg.token_whitelist ?? []).join(", "));
        setDelegationId(cfg.delegation_id);
        setEnabled(cfg.enabled);
      }
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

  async function onSave() {
    if (enabled && !delegationId) {
      setError({ message: "Le sniping requiert une délégation full_trust pour être armé" });
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const cfg = await api.upsertSnipeConfig({
        max_position: solToLamports(parseFloat(maxPosition) || 0),
        slippage_bps: parseInt(slippage, 10) || 200,
        max_latency_ms: parseInt(latency, 10) || 5000,
        token_whitelist: parseWhitelist(whitelist),
        delegation_id: delegationId,
        enabled,
      });
      setConfig(cfg);
      setSaved(true);
    } catch (err) {
      setError(toError(err));
    } finally {
      setSaving(false);
    }
  }

  async function onSimulateEvent() {
    setSniping(true);
    setError(null);
    setSnipeResult(null);
    try {
      const order = await api.snipeEvent({
        mint: mint.trim(),
        detected_latency_ms: parseInt(eventLatency, 10) || undefined,
      });
      setSnipeResult(order);
    } catch (err) {
      setError(toError(err));
    } finally {
      setSniping(false);
    }
  }

  return (
    <Screen
      title="Sniping"
      subtitle="Bot Full Trust déclenché sur événement on-chain"
      refreshing={refreshing}
      onRefresh={load}
    >
      <SectionLabel className="mt-1">Configuration du bot</SectionLabel>
      <Card>
        <View className="flex-row gap-3">
          <Input label="Position max" value={maxPosition} onChangeText={setMaxPosition} keyboardType="decimal-pad" suffix="SOL" className="flex-1" />
          <Input label="Slippage" value={slippage} onChangeText={setSlippage} keyboardType="numeric" suffix="bps" className="flex-1" />
        </View>
        <View className="h-3" />
        <Input label="Latence max" value={latency} onChangeText={setLatency} keyboardType="numeric" suffix="ms" helper="Un événement plus ancien que ce seuil est rejeté." />
        <View className="h-3" />
        <Input label="Routes / DEX autorisés" value={whitelist} onChangeText={setWhitelist} placeholder="optionnel" multiline />

        <Text className="text-content-secondary text-[13px] font-medium mt-4 mb-2">
          Délégation (full_trust)
        </Text>
        {delegations.length === 0 ? (
          <Text className="text-content-muted text-[12px]">
            Aucune délégation full_trust active. Créez-en une dans « Déléguer un budget ».
          </Text>
        ) : (
          <View className="flex-row flex-wrap">
            {delegations.map((d) => (
              <SelectChip
                key={d.id}
                label={`Full Trust · ${formatSol(d.amount_max, 2)}`}
                selected={delegationId === d.id}
                onPress={() => setDelegationId(d.id)}
              />
            ))}
          </View>
        )}

        <Text className="text-content-secondary text-[13px] font-medium mt-4 mb-2">État</Text>
        <View className="flex-row flex-wrap">
          <SelectChip label="Armé" selected={enabled} onPress={() => setEnabled(true)} />
          <SelectChip label="Désarmé" selected={!enabled} onPress={() => setEnabled(false)} />
        </View>

        {error ? <ErrorNote message={error.message} code={error.code} className="mt-4" /> : null}
        {saved ? (
          <SuccessNote className="mt-4">
            <Text className="text-primary text-[13px] font-semibold">
              Bot {config?.enabled ? "armé" : "désarmé"} et enregistré
            </Text>
          </SuccessNote>
        ) : null}
        <Button title="Enregistrer" onPress={onSave} loading={saving} fullWidth className="mt-4" />
      </Card>

      <SectionLabel className="mt-7">Simuler un événement « nouveau token »</SectionLabel>
      <Card>
        <Input label="Mint du token détecté" value={mint} onChangeText={setMint} multiline />
        <View className="h-3" />
        <Input label="Latence détectée" value={eventLatency} onChangeText={setEventLatency} keyboardType="numeric" suffix="ms" />
        {snipeResult ? (
          <SuccessNote className="mt-4">
            <Text className="text-primary text-[13px] font-semibold">
              Snipe {snipeResult.status} · {formatSol(snipeResult.input_amount)}
            </Text>
            {snipeResult.tx_signature ? (
              <Text
                className="text-info text-[12px] underline mt-1"
                onPress={() => Linking.openURL(explorerTxUrl(snipeResult.tx_signature!))}
              >
                {truncateAddress(snipeResult.tx_signature, 8, 8)} — explorer
              </Text>
            ) : null}
          </SuccessNote>
        ) : null}
        <Button
          title="Déclencher le snipe"
          onPress={onSimulateEvent}
          loading={sniping}
          fullWidth
          className="mt-4"
          disabled={!config?.enabled}
        />
        {!config?.enabled ? (
          <Text className="text-content-muted text-[12px] text-center mt-2">
            Armez le bot (avec une délégation full_trust) pour pouvoir déclencher un snipe.
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}
