import { Text, StyleSheet } from 'react-native';
import { api } from '../api';
import type { BotState, LogLevel } from '../types';
import { FONT, colors, fontSize } from '../theme';
import { Panel, TButton, TToggle, Stepper, KV } from '../components/ui';

export interface SnipeProps {
  state: BotState | null;
  safe: (fn: () => Promise<any>) => Promise<void>;
  notify: (level: LogLevel, msg: string) => void;
}

/** Écran Sniping. Présentation à la charte Shade, logique inchangée. */
export function SnipePanel({ state, safe }: SnipeProps) {
  const sn = state?.sniping;

  return (
    <>
      <Panel title="Moteur de sniping">
        <TToggle
          label={sn?.running ? 'En marche' : 'À l’arrêt'}
          value={!!sn?.running}
          onToggle={() => safe(() => (sn?.running ? api.snipeStop() : api.snipeStart()))}
        />
      </Panel>

      <Panel title="Paramètres">
        <Stepper
          label="Montant par snipe"
          value={sn?.amountSol ?? 0.01}
          unit="SOL"
          step={0.005}
          min={0.001}
          format={(v) => v.toFixed(3)}
          onChange={(v) => safe(() => api.snipeConfig({ amountSol: v }))}
        />
        <Stepper
          label="Tolérance au slippage"
          value={sn?.slippageBps ?? 1500}
          unit="bps"
          step={100}
          min={100}
          max={5000}
          format={(v) => `${v} (${(v / 100).toFixed(1)} %)`}
          onChange={(v) => safe(() => api.snipeConfig({ slippageBps: v }))}
        />
        <Stepper
          label="Délai maximum après détection"
          value={sn?.maxDelayMs ?? 3000}
          unit="ms"
          step={500}
          min={500}
          max={20000}
          onChange={(v) => safe(() => api.snipeConfig({ maxDelayMs: v }))}
        />
      </Panel>

      <Panel title={`Programmes surveillés (${sn?.programIds.length ?? 0})`}>
        {sn?.programIds.length ? (
          sn.programIds.map((p) => (
            <KV key={p} k="DEX" v={`${p.slice(0, 10)}…${p.slice(-6)}`} color={colors.secondary} />
          ))
        ) : (
          <Text style={styles.empty}>Aucun programme configuré.</Text>
        )}
        <Text style={styles.hint}>
          Raydium AMM v4 et pump.fun — se configurent dans backend/.env
        </Text>
        <TButton
          label="Simuler un nouveau pool"
          onPress={() => safe(() => api.demoTrigger('snipe'))}
        />
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { fontFamily: FONT, color: colors.muted, fontSize: fontSize.xs, lineHeight: 17 },
  hint: { fontFamily: FONT, color: colors.muted, fontSize: 11, lineHeight: 16 },
});
