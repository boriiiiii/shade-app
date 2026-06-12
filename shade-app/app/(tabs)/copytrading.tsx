import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Switch, Dimensions } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { ParsedTransactionWithMeta } from '@solana/web3.js';
import { useWallet } from '@/lib/wallet-store';
import { signAndSendTransaction, handlePhantomTransactionRedirect } from '@/lib/phantom';
import { solToLamports, SOL_MINT } from '@/lib/jupiter';
import { getSwapTransactionViaBackend, getSolanaSignatures, getSolanaTransaction } from '@/lib/api';
import { logger } from '@/lib/logger';
import Feather from '@expo/vector-icons/Feather';

const { height: screenHeight } = Dimensions.get('window');

const POLL_INTERVAL_MS = 6000;
const DEMO_MODE = false;

const DEMO_TRADES: DetectedTrade[] = [
  {
    signature: '3PHab2gkfseZhxZVww3TxP4euQbEKV8ENrdNUxCUQPascPKvvgZfP7QvycN3uzR7zJvnFEUApPYsvcxaDp4hxzi7',
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2',
    inputAmount: '0.250000',
    timestamp: Date.now() - 12000,
    copied: false,
  },
  {
    signature: '4JPUVydAGGddxrgeav55ZesuKZ2ztnjWu4Ux1qjxMN56bwZbo49Uw1uK4gDrqk2dNy1j1cMbDoTAdjpDSKicJagQ',
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    inputAmount: '0.100000',
    timestamp: Date.now() - 48000,
    copied: false,
  },
];

// Minimum SOL dépensé pour considérer un swap (hors frais seuls ~0.000005)
const MIN_SOL_SPENT = 0.0001;

interface DetectedTrade {
  signature: string;
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  timestamp: number;
  copied: boolean;
  copySignature?: string;
}

export default function CopytradingScreen() {
  const { phantomAddress, phantomSession, phantomSharedSecret, phantomDappPublicKey } = useWallet();

  const [targetWallet, setTargetWallet] = useState('SNsJudzcpNgMSeBPw3fLpBT2JaHy3vihfhMj4YkRHeV');
  const [copyAmountSol, setCopyAmountSol] = useState('0.03');
  const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null);
  const [autoCopy, setAutoCopy] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [trades, setTrades] = useState<DetectedTrade[]>([]);
  const [copyingSignature, setCopyingSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const knownSignaturesRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingCopyRef = useRef<DetectedTrade | null>(null);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      .then(r => r.json())
      .then(d => setSolPriceUsd(d?.solana?.usd ?? null))
      .catch(() => {});
  }, []);

  // Détecte achats (SOL→token) et ventes (token→SOL)
  const extractSwap = (tx: ParsedTransactionWithMeta, walletAddress: string): Pick<DetectedTrade, 'inputMint' | 'outputMint' | 'inputAmount'> | null => {
    try {
      if (tx.meta?.err) return null;

      const accountKeys = tx.transaction.message.accountKeys.map((k: any) =>
        typeof k === 'string' ? k : k.pubkey?.toString()
      );
      const walletIndex = accountKeys.indexOf(walletAddress);
      if (walletIndex === -1) return null;

      const preTokenBalances: any[] = tx.meta?.preTokenBalances ?? [];
      const postTokenBalances: any[] = tx.meta?.postTokenBalances ?? [];

      // Cherche un token reçu (achat) ou envoyé (vente) par ce wallet
      let tokenMint = '';
      let isBuy = false;

      for (const post of postTokenBalances) {
        if (post.owner !== walletAddress || post.mint === SOL_MINT) continue;
        const pre = preTokenBalances.find(p => p.mint === post.mint && p.owner === walletAddress);
        const postAmt = Number(post.uiTokenAmount.uiAmount ?? 0);
        const preAmt = Number(pre?.uiTokenAmount.uiAmount ?? 0);
        if (postAmt > preAmt) { tokenMint = post.mint; isBuy = true; break; }
      }

      if (!tokenMint) {
        for (const pre of preTokenBalances) {
          if (pre.owner !== walletAddress || pre.mint === SOL_MINT) continue;
          const post = postTokenBalances.find(p => p.mint === pre.mint && p.owner === walletAddress);
          const preAmt = Number(pre.uiTokenAmount.uiAmount ?? 0);
          const postAmt = Number(post?.uiTokenAmount.uiAmount ?? 0);
          if (preAmt > postAmt) { tokenMint = pre.mint; isBuy = false; break; }
        }
      }

      if (!tokenMint) return null;

      const preSol = tx.meta?.preBalances?.[walletIndex] ?? 0;
      const postSol = tx.meta?.postBalances?.[walletIndex] ?? 0;
      const solDelta = Math.abs(preSol - postSol) / 1_000_000_000;
      const solAmount = solDelta > MIN_SOL_SPENT ? solDelta : Math.abs((tx.meta?.preBalances?.[0] ?? 0) - (tx.meta?.postBalances?.[0] ?? 0)) / 1_000_000_000;

      return {
        inputMint: isBuy ? SOL_MINT : tokenMint,
        outputMint: isBuy ? tokenMint : SOL_MINT,
        inputAmount: solAmount.toFixed(6),
      };
    } catch {
      return null;
    }
  };

  const pollTarget = useCallback(async () => {
    if (!targetWallet) return;
    try {
      const sigs = await getSolanaSignatures(targetWallet, 15);

      const newSigs = sigs.filter(s => !knownSignaturesRef.current.has(s.signature));
      if (newSigs.length === 0) return;

      // Récupère toutes les nouvelles transactions en parallèle
      const txs = await Promise.all(
        newSigs.map(s => getSolanaTransaction(s.signature).catch(() => null))
      );

      for (let i = 0; i < newSigs.length; i++) {
        knownSignaturesRef.current.add(newSigs[i].signature);
        const tx = txs[i];
        if (!tx) continue;

        const trade = extractSwap(tx, targetWallet);
        if (!trade) continue;

        const detected: DetectedTrade = {
          signature: newSigs[i].signature,
          ...trade,
          timestamp: (newSigs[i].blockTime ?? 0) * 1000,
          copied: false,
        };

        logger.info('Trade detected', { signature: newSigs[i].signature, outputMint: trade.outputMint });
        setTrades(prev => [detected, ...prev.slice(0, 19)]);
        if (autoCopy) copytrade(detected);
      }
    } catch (e) {
      logger.warn('Poll error', { error: e });
    }
  }, [targetWallet, autoCopy]);

  useEffect(() => {
    if (!isMonitoring || !targetWallet) return;

    if (DEMO_MODE) {
      const t1 = setTimeout(() => {
        setTrades([DEMO_TRADES[0]]);
        logger.info('Trade detected', { signature: DEMO_TRADES[0].signature });
      }, 3000);
      const t2 = setTimeout(() => {
        setTrades(prev => [DEMO_TRADES[1], ...prev]);
        logger.info('Trade detected', { signature: DEMO_TRADES[1].signature });
      }, 9000);
      logger.info('Copytrading started', { target: targetWallet, seeded: 20 });
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    (async () => {
      try {
        const sigs = await getSolanaSignatures(targetWallet, 20);
        sigs.forEach(s => knownSignaturesRef.current.add(s.signature));
        logger.info('Copytrading started', { target: targetWallet, seeded: sigs.length });
      } catch {}
    })();

    intervalRef.current = setInterval(pollTarget, POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isMonitoring, targetWallet, pollTarget]);

  // Retour Phantom après signature d'une copytrade
  useEffect(() => {
    const handler = async (event: Linking.EventType) => {
      if (!event.url.includes('onPhantomCopy') || !phantomSharedSecret) return;
      try {
        // handlePhantomTransactionRedirect is now async: it decodes the signed tx
        // from Phantom and broadcasts it via sendRawTransaction
        const signature = await handlePhantomTransactionRedirect(event.url, phantomSharedSecret);
        logger.info('Copy tx broadcast', { signature });
        if (pendingCopyRef.current) {
          setTrades(prev => prev.map(t =>
            t.signature === pendingCopyRef.current!.signature
              ? { ...t, copied: true, copySignature: signature }
              : t
          ));
          pendingCopyRef.current = null;
        }
        setCopyingSignature(null);
      } catch (e: any) {
        logger.warn('Copy tx cancelled or failed', { error: e });
        setErrorMsg(e.message ?? 'Transaction cancelled');
        setCopyingSignature(null);
        pendingCopyRef.current = null;
      }
    };
    const sub = Linking.addEventListener('url', handler);
    return () => sub.remove();
  }, [phantomSharedSecret]);

  const copytrade = async (trade: DetectedTrade) => {
    logger.info('Copy clicked', { outputMint: trade.outputMint, copyAmountSol });

    if (!phantomAddress) { setErrorMsg('Connect Phantom first'); return; }
    if (!phantomSession || !phantomSharedSecret || !phantomDappPublicKey) {
      setErrorMsg('Reconnect Phantom (session expired)');
      return;
    }
    if (copyingSignature) return;

    setErrorMsg('');
    setCopyingSignature(trade.signature);

    try {
      logger.info('Fetching swap via backend', { outputMint: trade.outputMint });
      const lamports = solToLamports(parseFloat(copyAmountSol) || 0.05);
      const { swapTransaction: swapTx, quote } = await getSwapTransactionViaBackend(
        trade.outputMint, lamports, phantomAddress
      );
      logger.info('Swap tx ready', { outAmount: quote.outAmount });

      pendingCopyRef.current = trade;
      signAndSendTransaction(swapTx, phantomSession, phantomSharedSecret, phantomDappPublicKey, 'onPhantomCopy');
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to build transaction';
      logger.error('Copytrade failed', { message: msg });
      setErrorMsg(msg);
      setCopyingSignature(null);
      pendingCopyRef.current = null;
    }
  };

  const handleStart = () => {
    setErrorMsg('');
    if (!phantomAddress) {
      setErrorMsg('Connect Phantom first');
      return;
    }
    if (!phantomSharedSecret) {
      setErrorMsg('Reconnect Phantom to enable trading');
      return;
    }
    if (!targetWallet.trim()) {
      setErrorMsg('Enter a target wallet address');
      return;
    }
    knownSignaturesRef.current.clear();
    setTrades([]);
    setIsMonitoring(true);
  };

  const handleStop = () => {
    setIsMonitoring(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <ScrollView
      className="flex-1 bg-primary"
      contentContainerStyle={{ paddingHorizontal: 21, paddingTop: screenHeight * 0.073, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-text-primary font-satoshi text-2xl font-bold mb-xl">Copytrading</Text>

      {/* Paramètres */}
      <View className="gap-md mb-xl">
        <View>
          <Text className="text-text-muted font-satoshi text-xs mb-sm uppercase tracking-widest">
            Target Wallet
          </Text>
          <TextInput
            className="bg-cards rounded-lg px-lg py-md text-text-primary font-satoshi"
            placeholder="Solana wallet address"
            placeholderTextColor="#6B6B6B"
            value={targetWallet}
            onChangeText={t => { setTargetWallet(t); setErrorMsg(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isMonitoring}
          />
        </View>

        <View>
          <Text className="text-text-muted font-satoshi text-xs mb-sm uppercase tracking-widest">
            Copy Amount (SOL)
          </Text>
          <View className="bg-cards rounded-lg px-lg flex-row items-center">
            <TextInput
              className="flex-1 py-md text-text-primary font-satoshi"
              placeholder="0.05"
              placeholderTextColor="#6B6B6B"
              value={copyAmountSol}
              onChangeText={v => setCopyAmountSol(v.replace(',', '.'))}
              keyboardType="decimal-pad"
            />
            <Text className="text-text-muted font-satoshi text-sm">
              {(() => {
                const val = parseFloat(copyAmountSol);
                if (!solPriceUsd || isNaN(val) || copyAmountSol === '') return '≈ $—';
                const usd = val * solPriceUsd;
                const formatted = usd >= 1 ? usd.toFixed(2) : usd.toPrecision(2);
                return `≈ $${formatted}`;
              })()}
            </Text>
          </View>
        </View>

        <View className="bg-cards rounded-lg p-lg flex-row items-center justify-between">
          <View className="flex-1 mr-md">
            <Text className="text-text-primary font-satoshi text-sm font-medium">Auto-copy</Text>
            <Text className="text-text-muted font-satoshi text-xs mt-xs">
              Copy trades automatically without confirmation
            </Text>
          </View>
          <Switch
            value={autoCopy}
            onValueChange={setAutoCopy}
            trackColor={{ false: '#2A2A2A', true: '#6283FA' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Erreur */}
      {errorMsg ? (
        <View className="bg-error/10 rounded-lg p-lg mb-xl flex-row items-center gap-sm">
          <Feather name="alert-circle" size={14} color="#ef4444" />
          <Text className="text-error font-satoshi text-sm flex-1">{errorMsg}</Text>
        </View>
      ) : null}

      {/* Bouton Start / Stop */}
      {!isMonitoring ? (
        <Pressable
          className="bg-accent rounded-xl py-lg items-center mb-xl"
          onPress={handleStart}
        >
          <View className="flex-row items-center gap-sm">
            <Feather name="play-circle" size={18} color="#fff" />
            <Text className="text-text-primary font-satoshi font-bold text-base">Start Monitoring</Text>
          </View>
        </Pressable>
      ) : (
        <View className="gap-sm mb-xl">
          <View className="bg-cards rounded-lg p-lg flex-row items-center gap-sm">
            <ActivityIndicator size="small" color="#6283FA" />
            <Text className="text-text-secondary font-satoshi text-sm">
              Monitoring every {POLL_INTERVAL_MS / 1000}s…
            </Text>
          </View>
          <Pressable
            className="bg-error/80 rounded-xl py-lg items-center"
            onPress={handleStop}
          >
            <View className="flex-row items-center gap-sm">
              <Feather name="stop-circle" size={18} color="#fff" />
              <Text className="text-text-primary font-satoshi font-bold text-base">Stop</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Trades détectés */}
      {trades.length > 0 && (
        <View>
          <Text className="text-text-muted font-satoshi text-xs uppercase tracking-widest mb-md">
            Detected Trades
          </Text>
          <View className="gap-sm">
            {trades.map((trade, i) => (
              <View key={i} className="bg-cards rounded-lg p-lg">
                <View className="flex-row justify-between items-start mb-sm">
                  <View className="flex-1 mr-sm">
                    <Text className="text-text-primary font-satoshi text-sm font-medium">
                      {trade.inputMint === SOL_MINT
                        ? `BUY ${trade.inputAmount} SOL → token`
                        : `SELL token → ${trade.inputAmount} SOL`}
                    </Text>
                    <Text className="text-text-muted font-satoshi text-xs mt-xs" numberOfLines={1}>
                      {trade.inputMint === SOL_MINT ? trade.outputMint : trade.inputMint}
                    </Text>
                    <Text className="text-text-muted font-satoshi text-xs mt-xs">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  {trade.copied ? (
                    <View className="flex-row items-center gap-xs">
                      <Feather name="check-circle" size={14} color="#22c55e" />
                      <Text className="text-validation font-satoshi text-xs">Copied</Text>
                    </View>
                  ) : !autoCopy ? (
                    <Pressable
                      className={`bg-accent rounded-lg px-md py-sm ${copyingSignature === trade.signature ? 'opacity-50' : ''}`}
                      onPress={() => copytrade(trade)}
                      disabled={!!copyingSignature}
                    >
                      {copyingSignature === trade.signature
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text className="text-text-primary font-satoshi text-xs font-bold">Copy</Text>
                      }
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {isMonitoring && trades.length === 0 && (
        <View className="items-center mt-xl">
          <Text className="text-text-muted font-satoshi text-sm text-center">Waiting for trades…</Text>
        </View>
      )}
    </ScrollView>
  );
}
