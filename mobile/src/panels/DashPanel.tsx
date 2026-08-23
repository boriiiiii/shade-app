import { Text, StyleSheet } from 'react-native';
import { api } from '../api';
import type { BotState, LogLevel } from '../types';
import type { ConnectedWallet } from '../wallet/session';
import { MONO, colors } from '../theme';
import { Panel, TButton, TToggle, Row, KV, StatChip } from '../components/ui';

function short(a?: string | null) {
  return a ? `${a.slice(0, 6)}…${a.slice(-6)}` : '—';
}
function sol(v?: number | null) {
  return v != null ? `${v.toFixed(4)} SOL` : '…';
}

export interface DashProps {
  state: BotState | null;
  safe: (fn: () => Promise<any>) => Promise<void>;
  notify: (level: LogLevel, msg: string) => void;
  connectPhantom: () => Promise<void>;
  connecting: boolean;
  connectedWallet: ConnectedWallet | null;
  onDisconnect: () => void;
  demoFeed: boolean;
  setDemoFeed: (v: boolean) => void;
}

export function DashPanel({
  state,
  safe,
  connectPhantom,
  connecting,
  connectedWallet,
  onDisconnect,
  demoFeed,
  setDemoFeed,
}: DashProps) {
  const s = state;

  return (
    <>
      <Panel title="YOUR WALLET · trades & signs">
        {connectedWallet ? (
          <>
            <KV k="address" v={short(connectedWallet.address)} color={colors.green} />
            <KV
              k="balance"
              v={connectedWallet.balanceSol != null ? sol(connectedWallet.balanceSol) : 'syncing…'}
              color={colors.amber}
            />
            <Row>
              <TButton label="REFRESH" flex onPress={() => safe(() => api.refresh())} />
              <TButton label="DISCONNECT" flex variant="danger" onPress={onDisconnect} />
            </Row>
          </>
        ) : (
          <>
            <TButton
              label={connecting ? 'CONNECTING…' : 'CONNECT PHANTOM'}
              variant="primary"
              disabled={connecting}
              onPress={() => safe(connectPhantom)}
            />
            <Text style={styles.hint}>
              non-custodial: the bot never holds keys. You sign every trade in Phantom.
            </Text>
          </>
        )}
      </Panel>

      <Panel title="ENGINES">
        <TToggle
          label="COPYTRADE"
          value={!!s?.copytrade.running}
          onToggle={() => safe(() => (s?.copytrade.running ? api.copyStop() : api.copyStart()))}
        />
        <TToggle
          label="SNIPING"
          value={!!s?.sniping.running}
          onToggle={() => safe(() => (s?.sniping.running ? api.snipeStop() : api.snipeStart()))}
        />
        <TToggle
          label="DEMO FEED"
          value={demoFeed}
          onColor={colors.amber}
          onToggle={() =>
            safe(async () => {
              const r = await api.demoFeed(!demoFeed);
              setDemoFeed(r.running);
            })
          }
        />
        <Text style={styles.hint}>
          detections queue an order → approve &amp; sign each one in the ORDERS tab.
        </Text>
      </Panel>

      <Panel title="STATS">
        <Row>
          <StatChip label="DETECT." value={s?.stats.detections ?? 0} color={colors.cyan} />
          <StatChip label="ORDERS" value={s?.stats.ordersCreated ?? 0} color={colors.white} />
          <StatChip label="CONFIRMED" value={s?.stats.ordersConfirmed ?? 0} color={colors.green} />
          <StatChip label="FAILED" value={s?.stats.ordersFailed ?? 0} color={colors.red} />
        </Row>
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: MONO, color: colors.gray, fontSize: 10.5, fontStyle: 'italic', lineHeight: 15 },
});
