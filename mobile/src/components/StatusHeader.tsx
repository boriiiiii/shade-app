import { View, Text, StyleSheet } from 'react-native';
import { FONT, FONT_BOLD, colors, radius, spacing, fontSize } from '../theme';
import type { BotState } from '../types';
import type { ConnectedWallet } from '../wallet/session';

function short(a?: string | null) {
  return a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '—';
}

/** Badge d'état d'un moteur : pastille colorée + libellé. */
function Engine({ label, on }: { label: string; on: boolean }) {
  return (
    <View style={styles.badge}>
      <View style={[styles.badgeDot, { backgroundColor: on ? colors.up : colors.muted }]} />
      <Text style={[styles.badgeText, { color: on ? colors.text : colors.muted }]}>{label}</Text>
    </View>
  );
}

/**
 * En-tête : identité, état de la liaison, moteurs, réseau, wallet.
 *
 * Reprend la composition de l'en-tête Home de la maquette (pastille d'avatar à
 * gauche, informations à droite). Les données affichées sont inchangées.
 */
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
  const initial = connectedWallet?.address?.[0]?.toUpperCase() ?? 'S';
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.brand}>Shade</Text>
          <Text style={styles.subtitle}>Copy trading et sniping sur Solana</Text>
        </View>
        <View style={styles.badge}>
          <View
            style={[styles.badgeDot, { backgroundColor: connected ? colors.up : colors.down }]}
          />
          <Text style={styles.badgeText}>{connected ? 'En ligne' : 'Hors ligne'}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Engine label="Copy" on={!!state?.copytrade.running} />
        <Engine label="Snipe" on={!!state?.sniping.running} />
        <Text style={styles.meta}>Réseau {state?.network ?? '—'}</Text>
        <Text style={[styles.meta, pending > 0 ? { color: colors.secondary } : null]}>
          {pending} en attente
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          Wallet {connectedWallet ? short(connectedWallet.address) : 'non connecté'}
        </Text>
        {connectedWallet?.balanceSol != null ? (
          <Text style={styles.balance}>{connectedWallet.balanceSol.toFixed(3)} SOL</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT_BOLD,
    color: colors.primary,
    fontSize: fontSize.lg,
  },
  identity: { flex: 1 },
  brand: {
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: fontSize.lg,
  },
  subtitle: { fontFamily: FONT, color: colors.textSecond, fontSize: 11, marginTop: 1 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: FONT, color: colors.text, fontSize: 11 },
  meta: { fontFamily: FONT, color: colors.textSecond, fontSize: fontSize.xs },
  balance: {
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: fontSize.xs,
    marginLeft: 'auto',
  },
});
