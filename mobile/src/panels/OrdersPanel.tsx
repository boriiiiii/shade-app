import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import type { Order, OrderStatus } from '../types';
import { MONO, colors } from '../theme';
import { Panel, TButton, Row } from '../components/ui';

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: colors.amber,
  building: colors.cyan,
  awaiting: colors.amber,
  sent: colors.cyan,
  confirmed: colors.green,
  failed: colors.red,
  rejected: colors.gray,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'AWAITING APPROVAL',
  building: 'BUILDING…',
  awaiting: 'SIGN IN PHANTOM',
  sent: 'SENT · confirming…',
  confirmed: 'CONFIRMED',
  failed: 'FAILED',
  rejected: 'REJECTED',
};

const ACTIONABLE: OrderStatus[] = ['pending', 'awaiting', 'failed'];

function short(m: string) {
  return `${m.slice(0, 6)}…${m.slice(-4)}`;
}

export interface OrdersProps {
  orders: Order[];
  signingId: string | null;
  onApprove: (o: Order) => void;
  onReject: (o: Order) => void;
}

function OrderCard({
  o,
  signing,
  onApprove,
  onReject,
}: {
  o: Order;
  signing: boolean;
  onApprove: (o: Order) => void;
  onReject: (o: Order) => void;
}) {
  const actionable = ACTIONABLE.includes(o.status);
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.engine}>{o.engine.toUpperCase()}</Text>
        <Text style={[styles.status, { color: STATUS_COLOR[o.status] }]}>
          {signing ? 'SIGNING…' : STATUS_LABEL[o.status]}
        </Text>
      </View>
      <Text style={styles.line}>
        buy <Text style={styles.amount}>{o.amountSol} SOL</Text> of {short(o.outputMint)}
      </Text>
      <Text style={styles.sub}>
        slippage {o.slippageBps}bps
        {o.expectedOut ? ` · ~${o.expectedOut} units` : ''}
        {o.trigger ? ` · via ${o.trigger.kind}` : ''}
      </Text>
      {o.error ? <Text style={styles.err}>{o.error}</Text> : null}
      {o.signature ? (
        <Pressable onPress={() => o.explorerUrl && Linking.openURL(o.explorerUrl)}>
          <Text style={styles.sig}>↗ {o.signature.slice(0, 24)}…</Text>
        </Pressable>
      ) : null}
      {actionable ? (
        <Row style={{ marginTop: 8 }}>
          <TButton
            label={o.status === 'failed' ? 'RETRY' : 'APPROVE & SIGN'}
            flex
            variant="primary"
            disabled={signing}
            onPress={() => onApprove(o)}
          />
          <TButton label="REJECT" flex variant="danger" disabled={signing} onPress={() => onReject(o)} />
        </Row>
      ) : null}
    </View>
  );
}

export function OrdersPanel({ orders, signingId, onApprove, onReject }: OrdersProps) {
  const pending = orders.filter((o) => ACTIONABLE.includes(o.status) || o.status === 'building');
  const history = orders.filter((o) => !ACTIONABLE.includes(o.status) && o.status !== 'building');

  return (
    <>
      <Panel title={`PENDING ORDERS (${pending.length})`}>
        {pending.length ? (
          pending.map((o) => (
            <OrderCard key={o.id} o={o} signing={signingId === o.id} onApprove={onApprove} onReject={onReject} />
          ))
        ) : (
          <Text style={styles.empty}>no pending orders — start an engine or buy manually</Text>
        )}
      </Panel>

      <Panel title="HISTORY">
        {history.length ? (
          history
            .slice(0, 20)
            .map((o) => (
              <OrderCard key={o.id} o={o} signing={false} onApprove={onApprove} onReject={onReject} />
            ))
        ) : (
          <Text style={styles.empty}>no orders yet</Text>
        )}
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 3,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  engine: { fontFamily: MONO, color: colors.greenDim, fontSize: 10.5, letterSpacing: 1 },
  status: { fontFamily: MONO, fontSize: 10.5, fontWeight: '700' },
  line: { fontFamily: MONO, color: colors.white, fontSize: 13 },
  amount: { color: colors.amber, fontWeight: '700' },
  sub: { fontFamily: MONO, color: colors.gray, fontSize: 10.5 },
  err: { fontFamily: MONO, color: colors.red, fontSize: 10.5 },
  sig: { fontFamily: MONO, color: colors.cyan, fontSize: 11, marginTop: 2 },
  empty: { fontFamily: MONO, color: colors.gray, fontSize: 11, fontStyle: 'italic' },
});
