import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

import { useFonts } from 'expo-font';

import { FONT_ASSETS, colors, spacing } from './src/theme';
import { API_URL } from './src/config';
import { api } from './src/api';
import { useBotSocket } from './src/useBotSocket';
import { executeCommand } from './src/commands';
import {
  startPhantomConnect,
  signTransaction,
  handlePhantomRedirect,
  restorePhantomSession,
  clearPhantomSession,
} from './src/wallet/phantom';
import {
  loadWallet,
  saveWallet,
  loadPhantom,
  savePhantom,
  clearSession,
  type ConnectedWallet,
} from './src/wallet/session';
import type { LogLevel, Order } from './src/types';

import { StatusHeader } from './src/components/StatusHeader';
import { TabBar, TAB_BAR_HEIGHT } from './src/components/TabBar';
import {
  IconHome,
  IconTrend,
  IconSnipe,
  IconHistory,
  IconMore,
} from './src/components/icons';
import { LogView } from './src/components/LogView';
import { CommandBar } from './src/components/CommandBar';
import { DashPanel } from './src/panels/DashPanel';
import { CopyPanel } from './src/panels/CopyPanel';
import { SnipePanel } from './src/panels/SnipePanel';
import { OrdersPanel } from './src/panels/OrdersPanel';
import { AcademyPanel } from './src/panels/AcademyPanel';
import { FadeIn } from './src/components/motion';

type Tab = 'dash' | 'copy' | 'snipe' | 'orders' | 'academy' | 'term';

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function Shell() {
  const { logs, state, orders, connected, pushLocal, clearLogs } = useBotSocket();
  const [tab, setTab] = useState<Tab>('dash');
  const [demoFeed, setDemoFeed] = useState(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const pendingSignOrderId = useRef<string | null>(null);
  const booted = useRef(false);

  // Démarrage : bannière, sonde de santé, restauration de session.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    pushLocal('ok', 'SHADE // solana trading shell  v0.2');
    pushLocal('sys', `backend: ${API_URL}`);
    pushLocal('info', 'non-custodial · you sign every trade in Phantom.');
    api.health().then((hlt) => {
      if (hlt.ok) pushLocal('ok', `backend reachable (${hlt.network})`);
      else pushLocal('error', `backend UNREACHABLE → ${hlt.url} · is it running? same Wi-Fi?`);
    });
    loadWallet().then((w) => {
      if (w) {
        setWallet(w);
        pushLocal('ok', `wallet restored: ${short(w.address)}`);
      }
    });
    loadPhantom().then((p) => p && restorePhantomSession(p));
  }, [pushLocal]);

  // Retours Phantom (deep link) : connexion OU signature.
  useEffect(() => {
    const onUrl = (url: string) => {
      try {
        const res = handlePhantomRedirect(url);
        if (!res) return;
        if (res.kind === 'connect') {
          setConnecting(false);
          const w: ConnectedWallet = { address: res.publicKey, balanceSol: null };
          setWallet(w);
          void saveWallet(w);
          void savePhantom(res.session);
          pushLocal('ok', `wallet connected: ${res.publicKey}`);
        } else if (res.kind === 'sign') {
          const orderId = pendingSignOrderId.current;
          pendingSignOrderId.current = null;
          setSigningId(null);
          pushLocal('ok', 'signed in Phantom → submitting…');
          if (orderId) {
            api
              .submitSigned(orderId, res.signedTx)
              .then((r) =>
                pushLocal('ok', `submitted: ${r.order.signature?.slice(0, 20) ?? ''}…`),
              )
              .catch((e) => pushLocal('error', e.message));
          }
        }
      } catch (e: any) {
        setConnecting(false);
        setSigningId(null);
        pendingSignOrderId.current = null;
        pushLocal('error', `Phantom: ${e?.message ?? e}`);
      }
    };
    const sub = Linking.addEventListener('url', ({ url }) => onUrl(url));
    Linking.getInitialURL().then((u) => u && onUrl(u));
    return () => sub.remove();
  }, [pushLocal]);

  // Synchro backend best-effort : dès que le WS est up ET wallet connecté.
  useEffect(() => {
    if (!connected || !wallet?.address) return;
    api
      .connect(wallet.address)
      .then((r) =>
        setWallet((w) => {
          if (!w) return w;
          const nw = { ...w, balanceSol: r.balanceSol };
          void saveWallet(nw);
          return nw;
        }),
      )
      .catch(() => {});
  }, [connected, wallet?.address]);

  const connectPhantom = useCallback(async () => {
    try {
      setConnecting(true);
      await startPhantomConnect(state?.network ?? 'mainnet-beta');
      setTimeout(() => setConnecting(false), 90_000);
    } catch (e: any) {
      setConnecting(false);
      pushLocal('error', `cannot open Phantom: ${e?.message ?? e}`);
      pushLocal('info', 'simulator fallback → TERM tab: connect <address>');
    }
  }, [state?.network, pushLocal]);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    void clearSession();
    clearPhantomSession();
    api.disconnect().catch(() => {});
    pushLocal('info', 'wallet disconnected');
  }, [pushLocal]);

  // Approbation d'un ordre : build tx fraîche → signature dans Phantom.
  const approveOrder = useCallback(
    async (order: Order) => {
      if (!wallet) {
        pushLocal('error', 'connect Phantom first');
        return;
      }
      try {
        setSigningId(order.id);
        pushLocal('info', `building tx for ${short(order.outputMint)}…`);
        const { order: built } = await api.buildOrder(order.id);
        if (!built.txBase64) throw new Error('no transaction to sign');
        pendingSignOrderId.current = order.id;
        await signTransaction(built.txBase64);
        setTimeout(() => setSigningId((cur) => (cur === order.id ? null : cur)), 90_000);
      } catch (e: any) {
        setSigningId(null);
        pendingSignOrderId.current = null;
        pushLocal('error', `approve: ${e?.message ?? e}`);
      }
    },
    [wallet, pushLocal],
  );

  const rejectOrder = useCallback(
    (order: Order) => {
      api.rejectOrder(order.id).catch((e) => pushLocal('error', e.message));
    },
    [pushLocal],
  );

  const safe = useCallback(
    async (fn: () => Promise<any>) => {
      try {
        await fn();
      } catch (e: any) {
        pushLocal('error', e?.message ?? String(e));
      }
    },
    [pushLocal],
  );

  const notify = useCallback((level: LogLevel, msg: string) => pushLocal(level, msg), [pushLocal]);

  const onSubmit = useCallback(
    (cmd: string) => {
      pushLocal('info', `$ ${cmd}`);
      void executeCommand(cmd, { log: pushLocal, clear: clearLogs, connectPhantom });
    },
    [pushLocal, clearLogs, connectPhantom],
  );

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'awaiting').length;

  // Icônes issues de la maquette ; le libellé sert à l'accessibilité, la
  // navbar du Figma n'affiche que les pictogrammes.
  const tabs = [
    { key: 'dash', label: 'Accueil', icon: IconHome },
    { key: 'copy', label: 'Copy trading', icon: IconTrend, live: !!state?.copytrade.running },
    { key: 'snipe', label: 'Sniping', icon: IconSnipe, live: !!state?.sniping.running },
    { key: 'orders', label: 'Ordres', icon: IconHistory, live: pendingCount > 0 },
    { key: 'academy', label: 'Academy', icon: IconMore },
  ];

  const panelProps = { state, safe, notify };
  const displayWallet: ConnectedWallet | null = wallet
    ? wallet
    : state?.wallet.connectedAddress
      ? { address: state.wallet.connectedAddress, balanceSol: state.wallet.connectedBalanceSol }
      : null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <StatusHeader state={state} connected={connected} connectedWallet={displayWallet} pending={pendingCount} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {tab === 'term' ? (
          <View style={styles.termContent}>
            <LogView logs={logs} />
            <CommandBar onSubmit={onSubmit} />
          </View>
        ) : (
          <View style={styles.flex}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.panelContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Fondu au changement d'onglet — rejoue a chaque bascule */}
              <FadeIn trigger={tab}>
              {tab === 'dash' && (
                <DashPanel
                  {...panelProps}
                  connectPhantom={connectPhantom}
                  connecting={connecting}
                  connectedWallet={displayWallet}
                  onDisconnect={disconnectWallet}
                  demoFeed={demoFeed}
                  setDemoFeed={setDemoFeed}
                />
              )}
              {tab === 'copy' && <CopyPanel {...panelProps} />}
              {tab === 'snipe' && <SnipePanel {...panelProps} />}
              {tab === 'orders' && (
                <OrdersPanel
                  orders={orders}
                  signingId={signingId}
                  onApprove={approveOrder}
                  onReject={rejectOrder}
                />
              )}
              {tab === 'academy' && <AcademyPanel onOpenConsole={() => setTab('term')} />}
              </FadeIn>
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>

      <TabBar items={tabs} active={tab} onChange={(k) => setTab(k as Tab)} />
    </SafeAreaView>
  );
}

export default function App() {
  // Satoshi doit être résolue avant le premier rendu : les styles y font
  // référence par nom de famille. On garde le fond Shade pendant le chargement
  // pour éviter un flash blanc.
  const [fontsLoaded] = useFonts(FONT_ASSETS);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  panelContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    // La barre flotte au-dessus : on lui réserve sa hauteur, plus une marge.
    paddingBottom: TAB_BAR_HEIGHT + spacing.xl,
  },
  termContent: { flex: 1, paddingBottom: TAB_BAR_HEIGHT },
});
