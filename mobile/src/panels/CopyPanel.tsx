import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { api } from '../api';
import type { BotState, LogLevel } from '../types';
import { FONT, colors, radius, spacing, fontSize } from '../theme';
import { Panel, TButton, TToggle, Segmented, Stepper, TInput } from '../components/ui';

export interface CopyProps {
  state: BotState | null;
  safe: (fn: () => Promise<any>) => Promise<void>;
  notify: (level: LogLevel, msg: string) => void;
}

function short(a: string) {
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}

/** Écran Copy trading. Présentation à la charte Shade, logique inchangée. */
export function CopyPanel({ state, safe, notify }: CopyProps) {
  const [target, setTarget] = useState('');
  const c = state?.copytrade;

  const add = () => {
    const v = target.trim();
    if (!v) return notify('error', 'Adresse vide');
    safe(async () => {
      await api.copyAdd(v);
      setTarget('');
    });
  };

  return (
    <>
      <Panel title="Moteur de copy trading">
        <TToggle
          label={c?.running ? 'En marche' : 'À l’arrêt'}
          value={!!c?.running}
          onToggle={() => safe(() => (c?.running ? api.copyStop() : api.copyStart()))}
        />
      </Panel>

      <Panel title="Montant copié">
        <Segmented
          options={[
            { label: 'Fixe', value: 'fixed' },
            { label: 'Proportionnel', value: 'proportional' },
          ]}
          value={c?.amountMode ?? 'fixed'}
          onChange={(v) => safe(() => api.copyConfig({ amountMode: v }))}
        />
        {c?.amountMode === 'proportional' ? (
          <Stepper
            label="Part du montant du trader suivi"
            value={c?.proportionalPct ?? 100}
            unit="%"
            step={5}
            min={5}
            max={500}
            onChange={(v) => safe(() => api.copyConfig({ proportionalPct: v }))}
          />
        ) : (
          <Stepper
            label="Montant fixe par trade"
            value={c?.fixedSol ?? 0.01}
            unit="SOL"
            step={0.005}
            min={0.001}
            format={(v) => v.toFixed(3)}
            onChange={(v) => safe(() => api.copyConfig({ fixedSol: v }))}
          />
        )}
      </Panel>

      <Panel title={`Wallets suivis (${c?.targets.length ?? 0})`}>
        <TInput
          value={target}
          onChangeText={setTarget}
          placeholder="Adresse Solana à copier"
          onSubmit={add}
          actionLabel="Ajouter"
          onAction={add}
        />
        {c?.targets.length ? (
          c.targets.map((t) => (
            <View key={t} style={styles.targetRow}>
              <Text style={styles.targetAddr} numberOfLines={1}>
                {short(t)}
              </Text>
              <Pressable
                onPress={() => safe(() => api.copyRemove(t))}
                hitSlop={8}
                style={styles.remove}
                accessibilityRole="button"
                accessibilityLabel={`Retirer ${short(t)}`}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>Aucun wallet suivi — ajoute une adresse ci-dessus.</Text>
        )}
        <TButton
          label="Simuler un trade suivi"
          onPress={() => safe(() => api.demoTrigger('copy'))}
        />
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  targetAddr: { fontFamily: FONT, color: colors.text, fontSize: fontSize.xs, flexShrink: 1 },
  remove: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    marginLeft: spacing.sm,
  },
  removeText: { fontFamily: FONT, color: colors.down, fontSize: 16, lineHeight: 18 },
  empty: { fontFamily: FONT, color: colors.muted, fontSize: fontSize.xs, lineHeight: 17 },
});
