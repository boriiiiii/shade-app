import { View, Text, StyleSheet } from 'react-native';
import { MONO, colors } from '../theme';
import type { BotState } from '../types';
import type { ConnectedWallet } from '../wallet/session';

function short(a?: string | null) {
  return a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '—';
}

/** Une "pastille" moteur : ● vert si ON, ○ gris si OFF. */
function Engine({ label, on }: { label: string; on: boolean }) {
  return (
    <Text style={[styles.badge, { color: on ? colors.green : colors.gray }]}>
      {on ? '●' : '○'} {label}
    </Text>
  );
}

/** Barre de statut haute : identité, réseau, moteurs, wallet, connexion WS. */
export function StatusHeader({
  state,
  connected,
  connectedWallet,
  pending = 0,
}: {
  state: BotState | null;
  connected: boolean;
  connectedWallet?: ConnectedWallet | null;
  pending?: number;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.brand}>
          ▓▓ SHADE <Text style={{ color: colors.greenDim }}>// solana trading shell</Text>
        </Text>
        <Text style={[styles.link, { color: connected ? colors.green : colors.red }]}>
          {connected ? 'LINK ●' : 'LINK ○'}
        </Text>
      </View>
      <View style={styles.row}>
        <Engine label="COPY" on={!!state?.copytrade.running} />
        <Engine label="SNIPE" on={!!state?.sniping.running} />
        <Text style={styles.meta}>net:{state?.network ?? '—'}</Text>
        <Text style={[styles.meta, { color: pending > 0 ? colors.amber : colors.gray }]}>
          orders:{pending}⧗
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>
          wallet:{connectedWallet ? short(connectedWallet.address) : 'not connected'}
        </Text>
        <Text style={[styles.meta, { color: colors.amber }]}>
          {connectedWallet?.balanceSol != null ? connectedWallet.balanceSol.toFixed(3) + '◎' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  brand: { fontFamily: MONO, color: colors.green, fontSize: 15, fontWeight: '700', flex: 1 },
  link: { fontFamily: MONO, fontSize: 12 },
  badge: { fontFamily: MONO, fontSize: 12 },
  meta: { fontFamily: MONO, color: colors.gray, fontSize: 11 },
});
