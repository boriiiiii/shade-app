import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { api } from '../api';
import type { BotState, LogLevel } from '../types';
import { MONO, colors } from '../theme';
import { Panel, TButton, TToggle, Segmented, Stepper, TInput } from '../components/ui';

export interface CopyProps {
  state: BotState | null;
  safe: (fn: () => Promise<any>) => Promise<void>;
  notify: (level: LogLevel, msg: string) => void;
}

function short(a: string) {
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}

export function CopyPanel({ state, safe, notify }: CopyProps) {
  const [target, setTarget] = useState('');
  const c = state?.copytrade;

  const add = () => {
    const v = target.trim();
    if (!v) return notify('error', 'empty address');
    safe(async () => {
      await api.copyAdd(v);
      setTarget('');
    });
  };

  return (
    <>
      <Panel title="COPYTRADE ENGINE">
        <TToggle
          label={c?.running ? 'RUNNING' : 'STOPPED'}
          value={!!c?.running}
          onToggle={() => safe(() => (c?.running ? api.copyStop() : api.copyStart()))}
        />
      </Panel>

      <Panel title="COPY AMOUNT">
        <Segmented
          options={[
            { label: 'FIXED', value: 'fixed' },
            { label: 'PROPORTIONAL', value: 'proportional' },
          ]}
          value={c?.amountMode ?? 'fixed'}
          onChange={(v) => safe(() => api.copyConfig({ amountMode: v }))}
        />
        {c?.amountMode === 'proportional' ? (
          <Stepper
            label="% of target amount"
            value={c?.proportionalPct ?? 100}
            unit="%"
            step={5}
            min={5}
            max={500}
            onChange={(v) => safe(() => api.copyConfig({ proportionalPct: v }))}
          />
        ) : (
          <Stepper
            label="fixed amount per trade"
            value={c?.fixedSol ?? 0.01}
            unit="SOL"
            step={0.005}
            min={0.001}
            format={(v) => v.toFixed(3)}
            onChange={(v) => safe(() => api.copyConfig({ fixedSol: v }))}
          />
        )}
      </Panel>

      <Panel title={`TARGETS (${c?.targets.length ?? 0})`}>
        <TInput
          value={target}
          onChangeText={setTarget}
          placeholder="Solana address to copy"
          onSubmit={add}
          actionLabel="ADD"
          onAction={add}
        />
        {c?.targets.length ? (
          c.targets.map((t) => (
            <View key={t} style={styles.targetRow}>
              <Text style={styles.targetAddr} numberOfLines={1}>
                {short(t)}
              </Text>
              <Pressable onPress={() => safe(() => api.copyRemove(t))} hitSlop={8}>
                <Text style={styles.remove}>[×]</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>no targets — add an address above</Text>
        )}
        <TButton label="SIMULATE A TARGET TRADE" onPress={() => safe(() => api.demoTrigger('copy'))} />
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  targetAddr: { fontFamily: MONO, color: colors.green, fontSize: 12, flexShrink: 1 },
  remove: { fontFamily: MONO, color: colors.red, fontSize: 13, fontWeight: '700', marginLeft: 8 },
  empty: { fontFamily: MONO, color: colors.gray, fontSize: 11, fontStyle: 'italic' },
});
