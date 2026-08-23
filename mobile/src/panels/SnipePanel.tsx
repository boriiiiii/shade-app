import { Text, StyleSheet } from 'react-native';
import { api } from '../api';
import type { BotState, LogLevel } from '../types';
import { MONO, colors } from '../theme';
import { Panel, TButton, TToggle, Stepper, KV } from '../components/ui';

export interface SnipeProps {
  state: BotState | null;
  safe: (fn: () => Promise<any>) => Promise<void>;
  notify: (level: LogLevel, msg: string) => void;
}

export function SnipePanel({ state, safe }: SnipeProps) {
  const sn = state?.sniping;

  return (
    <>
      <Panel title="SNIPING ENGINE">
        <TToggle
          label={sn?.running ? 'RUNNING' : 'STOPPED'}
          value={!!sn?.running}
          onToggle={() => safe(() => (sn?.running ? api.snipeStop() : api.snipeStart()))}
        />
      </Panel>

      <Panel title="SNIPE PARAMETERS">
        <Stepper
          label="amount per snipe"
          value={sn?.amountSol ?? 0.01}
          unit="SOL"
          step={0.005}
          min={0.001}
          format={(v) => v.toFixed(3)}
          onChange={(v) => safe(() => api.snipeConfig({ amountSol: v }))}
        />
        <Stepper
          label="slippage tolerance"
          value={sn?.slippageBps ?? 1500}
          unit="bps"
          step={100}
          min={100}
          max={5000}
          format={(v) => `${v} (${(v / 100).toFixed(1)}%)`}
          onChange={(v) => safe(() => api.snipeConfig({ slippageBps: v }))}
        />
        <Stepper
          label="max delay after detection"
          value={sn?.maxDelayMs ?? 3000}
          unit="ms"
          step={500}
          min={500}
          max={20000}
          onChange={(v) => safe(() => api.snipeConfig({ maxDelayMs: v }))}
        />
      </Panel>

      <Panel title={`WATCHED PROGRAMS (${sn?.programIds.length ?? 0})`}>
        {sn?.programIds.length ? (
          sn.programIds.map((p) => <KV key={p} k="dex" v={`${p.slice(0, 10)}…${p.slice(-6)}`} color={colors.cyan} />)
        ) : (
          <Text style={styles.empty}>no program configured</Text>
        )}
        <Text style={styles.hint}>Raydium AMM v4 / pump.fun (configure via backend/.env)</Text>
        <TButton label="SIMULATE A NEW POOL" onPress={() => safe(() => api.demoTrigger('snipe'))} />
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { fontFamily: MONO, color: colors.gray, fontSize: 11, fontStyle: 'italic' },
  hint: { fontFamily: MONO, color: colors.gray, fontSize: 10.5, fontStyle: 'italic' },
});
