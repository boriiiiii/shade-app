import { Text, View, StyleSheet } from 'react-native';
import { api } from '../api';
import type { BotState, LogLevel } from '../types';
import type { ConnectedWallet } from '../wallet/session';
import { FONT, FONT_BOLD, colors, radius, spacing, fontSize } from '../theme';
import { Panel, TButton, TToggle, Row, StatChip } from '../components/ui';

function short(a?: string | null) {
  return a ? `${a.slice(0, 6)}…${a.slice(-6)}` : '—';
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

/**
 * Écran d'accueil, repris de la frame « Home » de la maquette : carte de solde
 * en grand, puis les moteurs et les statistiques.
 *
 * Aucune logique n'est modifiée par rapport à la version terminal : mêmes
 * appels `api.*`, mêmes props, mêmes gestionnaires.
 */
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
      {/* Carte de solde — équivalent du bloc « Binance / $415.70 » du Figma */}
      <View style={styles.hero}>
        {connectedWallet ? (
          <>
            <Text style={styles.heroLabel}>Solde du wallet</Text>
            <Text style={styles.heroValue}>
              {connectedWallet.balanceSol != null
                ? connectedWallet.balanceSol.toFixed(4)
                : '—'}
              <Text style={styles.heroUnit}> SOL</Text>
            </Text>
            <Text style={styles.heroAddress}>{short(connectedWallet.address)}</Text>
            <Row style={styles.heroActions}>
              <TButton label="Actualiser" flex onPress={() => safe(() => api.refresh())} />
              <TButton label="Déconnecter" flex variant="danger" onPress={onDisconnect} />
            </Row>
          </>
        ) : (
          <>
            <Text style={styles.heroLabel}>Aucun wallet connecté</Text>
            <Text style={styles.heroEmpty}>—</Text>
            <TButton
              label={connecting ? 'Connexion…' : 'Connecter Phantom'}
              variant="primary"
              disabled={connecting}
              onPress={() => safe(connectPhantom)}
            />
            <Text style={styles.hint}>
              Non-custodial : le bot ne détient aucune clé. Chaque transaction est signée par toi
              dans Phantom.
            </Text>
          </>
        )}
      </View>

      <Panel title="Moteurs">
        <TToggle
          label="Copy trading"
          value={!!s?.copytrade.running}
          onToggle={() => safe(() => (s?.copytrade.running ? api.copyStop() : api.copyStart()))}
        />
        <TToggle
          label="Sniping"
          value={!!s?.sniping.running}
          onToggle={() => safe(() => (s?.sniping.running ? api.snipeStop() : api.snipeStart()))}
        />
        <TToggle
          label="Flux de démonstration"
          value={demoFeed}
          onColor={colors.mainShape}
          onToggle={() =>
            safe(async () => {
              const r = await api.demoFeed(!demoFeed);
              setDemoFeed(r.running);
            })
          }
        />
        <Text style={styles.hint}>
          Chaque détection crée un ordre à approuver et à signer depuis l&apos;onglet Ordres.
        </Text>
      </Panel>

      <Panel title="Statistiques">
        <Row>
          <StatChip
            label="Détections"
            value={s?.stats.detections ?? 0}
            color={colors.secondary}
          />
          <StatChip label="Ordres" value={s?.stats.ordersCreated ?? 0} color={colors.text} />
        </Row>
        <Row>
          <StatChip label="Confirmés" value={s?.stats.ordersConfirmed ?? 0} color={colors.up} />
          <StatChip label="Échoués" value={s?.stats.ordersFailed ?? 0} color={colors.down} />
        </Row>
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroLabel: { fontFamily: FONT, color: colors.textSecond, fontSize: fontSize.base },
  heroValue: {
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: 44,
    letterSpacing: -1,
  },
  // Text imbriqué : sans fontFamily explicite il hériterait du Bold du parent.
  heroUnit: { fontFamily: FONT, fontSize: 20, color: colors.textSecond },
  heroEmpty: {
    fontFamily: FONT_BOLD,
    color: colors.muted,
    fontSize: 44,
    marginBottom: spacing.sm,
  },
  heroAddress: { fontFamily: FONT, color: colors.textSecond, fontSize: fontSize.xs },
  heroActions: { alignSelf: 'stretch', marginTop: spacing.md },
  hint: {
    fontFamily: FONT,
    color: colors.textSecond,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
