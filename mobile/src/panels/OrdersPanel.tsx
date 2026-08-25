import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import type { Order, OrderStatus } from '../types';
import { FONT, FONT_BOLD, colors, radius, spacing, fontSize } from '../theme';
import { Panel, TButton, Row } from '../components/ui';

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: colors.mainShape,
  building: colors.secondary,
  awaiting: colors.mainShape,
  sent: colors.secondary,
  confirmed: colors.up,
  failed: colors.down,
  rejected: colors.muted,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'À approuver',
  building: 'Construction…',
  awaiting: 'À signer dans Phantom',
  sent: 'Envoyé · confirmation…',
  confirmed: 'Confirmé',
  failed: 'Échoué',
  rejected: 'Rejeté',
};

const ENGINE_LABEL: Record<string, string> = {
  copy: 'Copy trading',
  copytrade: 'Copy trading',
  snipe: 'Sniping',
  sniping: 'Sniping',
  manual: 'Manuel',
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
        <Text style={styles.engine}>{ENGINE_LABEL[o.engine] ?? o.engine}</Text>
        <View style={styles.statusWrap}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[o.status] }]} />
          <Text style={[styles.status, { color: STATUS_COLOR[o.status] }]}>
            {signing ? 'Signature…' : STATUS_LABEL[o.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.line}>
        Achat de <Text style={styles.amount}>{o.amountSol} SOL</Text> en {short(o.outputMint)}
      </Text>
      <Text style={styles.sub}>
        Slippage {o.slippageBps} bps
        {o.expectedOut ? ` · environ ${o.expectedOut} unités` : ''}
        {o.trigger ? ` · via ${o.trigger.kind}` : ''}
      </Text>
      {o.error ? <Text style={styles.err}>{o.error}</Text> : null}
      {o.signature ? (
        <Pressable
          onPress={() => o.explorerUrl && Linking.openURL(o.explorerUrl)}
          accessibilityRole="link"
          accessibilityLabel="Ouvrir la transaction dans l’explorateur"
        >
          <Text style={styles.sig}>Voir la transaction · {o.signature.slice(0, 16)}…</Text>
        </Pressable>
      ) : null}
      {actionable ? (
        <Row style={{ marginTop: spacing.md }}>
          <TButton
            label={o.status === 'failed' ? 'Réessayer' : 'Approuver et signer'}
            flex
            variant="primary"
            disabled={signing}
            onPress={() => onApprove(o)}
          />
          <TButton
            label="Rejeter"
            flex
            variant="danger"
            disabled={signing}
            onPress={() => onReject(o)}
          />
        </Row>
      ) : null}
    </View>
  );
}

/** Écran Ordres. Présentation à la charte Shade, logique inchangée. */
export function OrdersPanel({ orders, signingId, onApprove, onReject }: OrdersProps) {
  const pending = orders.filter((o) => ACTIONABLE.includes(o.status) || o.status === 'building');
  const history = orders.filter((o) => !ACTIONABLE.includes(o.status) && o.status !== 'building');

  return (
    <>
      <Panel title={`Ordres en attente (${pending.length})`}>
        {pending.length ? (
          pending.map((o) => (
            <OrderCard
              key={o.id}
              o={o}
              signing={signingId === o.id}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))
        ) : (
          <Text style={styles.empty}>
            Aucun ordre en attente — démarre un moteur ou achète manuellement.
          </Text>
        )}
      </Panel>

      <Panel title="Historique">
        {history.length ? (
          history
            .slice(0, 20)
            .map((o) => (
              <OrderCard
                key={o.id}
                o={o}
                signing={false}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
        ) : (
          <Text style={styles.empty}>Aucun ordre pour le moment.</Text>
        )}
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  engine: { fontFamily: FONT_BOLD, color: colors.textSecond, fontSize: 11 },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  status: { fontFamily: FONT_BOLD, fontSize: 11 },
  line: { fontFamily: FONT, color: colors.text, fontSize: fontSize.sm },
  amount: { fontFamily: FONT_BOLD, color: colors.up },
  sub: { fontFamily: FONT, color: colors.muted, fontSize: 11, lineHeight: 16 },
  err: { fontFamily: FONT, color: colors.down, fontSize: 11, lineHeight: 16 },
  sig: { fontFamily: FONT, color: colors.secondary, fontSize: 11, marginTop: 2 },
  empty: { fontFamily: FONT, color: colors.muted, fontSize: fontSize.xs, lineHeight: 17 },
});
