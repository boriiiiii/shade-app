import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useFocusEffect, useRouter } from "expo-router";

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
import { DelegationCard } from "../../components/DelegationCard";
import { api } from "../../lib/api/client";
import type { Delegation, ExecutionMode } from "../../lib/api/types";
import { useAuth } from "../../lib/auth/AuthContext";
import { toError } from "../../lib/errors";
import { explorerTxUrl, formatSol, solToLamports } from "../../lib/format";
import { MINTS } from "../../lib/theme";

type DelegMode = Extract<ExecutionMode, "degen" | "full_trust">;

const MODES: { value: DelegMode; label: string; hint: string }[] = [
  { value: "degen", label: "Degen", hint: "Session temporaire (durée + budget)" },
  { value: "full_trust", label: "Full Trust", hint: "Budget dédié pour le sniping 24/7" },
];

export default function DelegateScreen() {
  const { adapter } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<DelegMode>("degen");
  const [amount, setAmount] = useState("0.5");
  const [hours, setHours] = useState("2");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [created, setCreated] = useState<Delegation | null>(null);

  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setDelegations(await api.listDelegations());
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

  async function onSubmit() {
    const sol = parseFloat(amount);
    const h = parseFloat(hours);
    if (!Number.isFinite(sol) || sol <= 0) {
      setError({ message: "Montant invalide" });
      return;
    }
    if (!Number.isFinite(h) || h <= 0) {
      setError({ message: "Durée invalide" });
      return;
    }
    setSubmitting(true);
    setError(null);
    setCreated(null);
    try {
      // 1) Le backend construit la tx Approve (wrap SOL→wSOL inclus).
      const prepared = await api.prepareDelegation({
        mode,
        mint: MINTS.WSOL,
        amount: solToLamports(sol),
        duration_seconds: Math.round(h * 3600),
        wrap_sol: true,
      });
      // 2) L'utilisateur signe et diffuse l'Approve dans son wallet.
      const sig = await adapter.signAndSendTransaction(prepared.unsigned_tx);
      // 3) Le backend enregistre la délégation active.
      const deleg = await api.confirmDelegation(prepared.delegation_id, sig);
      setCreated(deleg);
      await load();
    } catch (err) {
      setError(toError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      title="Déléguer un budget"
      subtitle="SPL Approve — révocable on-chain à tout moment"
      refreshing={refreshing}
      onRefresh={load}
      rightElement={<Button title="Fermer" variant="ghost" size="sm" onPress={() => router.back()} />}
    >
      <Card className="mt-1">
        <SectionLabel>Mode</SectionLabel>
        <View className="flex-row flex-wrap">
          {MODES.map((m) => (
            <SelectChip
              key={m.value}
              label={m.label}
              selected={mode === m.value}
              onPress={() => setMode(m.value)}
            />
          ))}
        </View>
        <Text className="text-content-muted text-[12px] mb-4">
          {MODES.find((m) => m.value === mode)?.hint}
        </Text>

        <Input
          label="Budget max"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          suffix="SOL"
          helper="Plafond dur approuvé on-chain. Le side wallet ne pourra jamais dépasser."
        />
        <View className="h-3" />
        <Input
          label="Durée"
          value={hours}
          onChangeText={setHours}
          keyboardType="decimal-pad"
          suffix="heures"
          helper="Au-delà, l'exécution déléguée est refusée par le backend."
        />

        {error ? <ErrorNote message={error.message} code={error.code} className="mt-4" /> : null}
        {created ? (
          <SuccessNote className="mt-4">
            <Text className="text-primary text-[13px] font-semibold">
              Délégation {created.status} — {formatSol(created.amount_max)}
            </Text>
            {created.approve_tx_sig ? (
              <Text
                className="text-info text-[12px] underline mt-1"
                onPress={() => Linking.openURL(explorerTxUrl(created.approve_tx_sig!))}
              >
                Voir l'approbation sur l'explorer
              </Text>
            ) : null}
          </SuccessNote>
        ) : null}

        <Button
          title="Signer l'approbation"
          onPress={onSubmit}
          loading={submitting}
          fullWidth
          className="mt-4"
        />
      </Card>

      <SectionLabel className="mt-7">Mes délégations</SectionLabel>
      {delegations.length === 0 ? (
        <Card>
          <Text className="text-content-secondary text-[14px] text-center py-4">
            Aucune délégation pour l'instant.
          </Text>
        </Card>
      ) : (
        delegations.map((d) => (
          <DelegationCard
            key={d.id}
            delegation={d}
            revoking={revokingId === d.id}
            onRevoke={async (id) => {
              setRevokingId(id);
              setError(null);
              try {
                const prepared = await api.revokeDelegation(id);
                await adapter.signAndSendTransaction(prepared.unsigned_tx);
                await load();
              } catch (err) {
                setError(toError(err));
              } finally {
                setRevokingId(null);
              }
            }}
          />
        ))
      )}
    </Screen>
  );
}
