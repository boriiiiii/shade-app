import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useWallet } from '@/lib/wallet-store';
import { signAndSendTransaction, handlePhantomTransactionRedirect, deserializeSecret } from '@/lib/phantom';
import { solToLamports, lamportsToSol } from '@/lib/jupiter';
import { getSwapTransactionViaBackend } from '@/lib/api';
import { logger } from '@/lib/logger';
import Feather from '@expo/vector-icons/Feather';

const { height: screenHeight } = Dimensions.get('window');

type SnipeStatus = 'idle' | 'fetching_quote' | 'ready' | 'waiting_sign' | 'success' | 'error';

interface SnipeResult {
  signature: string;
  tokenMint: string;
  amountSol: string;
  outAmount: string;
  timestamp: number;
}

export default function SnipeScreen() {
  const { phantomAddress, phantomSession, phantomSharedSecret, phantomDappPublicKey } = useWallet();

  const [tokenMint, setTokenMint] = useState('');
  const [amountSol, setAmountSol] = useState('');
  const [slippage, setSlippage] = useState('3');
  const [status, setStatus] = useState<SnipeStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<SnipeResult[]>([]);

  const pendingTxRef = useRef<{ quote: any; amountSol: string } | null>(null);

  // Écoute le retour de Phantom après signature
  useEffect(() => {
    const handler = async (event: Linking.EventType) => {
      if (!event.url.includes('onPhantomTx')) return;
      if (!phantomSharedSecret) return;

      try {
        const secret = phantomSharedSecret instanceof Uint8Array
          ? phantomSharedSecret
          : deserializeSecret(phantomSharedSecret as unknown as string);

        // handlePhantomTransactionRedirect is now async: it decodes the signed tx
        // from Phantom and broadcasts it via sendRawTransaction
        const signature = await handlePhantomTransactionRedirect(event.url, secret);
        logger.info('Snipe tx broadcast', { signature });

        if (pendingTxRef.current) {
          setHistory(prev => [{
            signature,
            tokenMint: tokenMint,
            amountSol: pendingTxRef.current!.amountSol,
            outAmount: pendingTxRef.current!.quote?.outAmount ?? '?',
            timestamp: Date.now(),
          }, ...prev]);
          pendingTxRef.current = null;
        }
        setStatus('success');
        setQuote(null);
      } catch (e: any) {
        logger.error('Snipe tx error', { error: e });
        setErrorMsg(e.message ?? 'Transaction cancelled');
        setStatus('error');
        pendingTxRef.current = null;
      }
    };

    const sub = Linking.addEventListener('url', handler);
    return () => sub.remove();
  }, [phantomSharedSecret, tokenMint]);

  const handleFetchQuote = async () => {
    if (!tokenMint.trim() || !amountSol.trim()) return;
    setStatus('fetching_quote');
    setErrorMsg('');
    setQuote(null);
    try {
      const lamports = solToLamports(parseFloat(amountSol));
      const { quote: q } = await getSwapTransactionViaBackend(
        tokenMint.trim(), lamports, phantomAddress ?? '', Math.round(parseFloat(slippage) * 100)
      );
      setQuote(q);
      setStatus('ready');
    } catch (e: any) {
      logger.error('Quote fetch failed', { error: e });
      setErrorMsg(e.message ?? 'Failed to fetch quote');
      setStatus('error');
    }
  };

  const handleSnipe = async () => {
    if (!quote || !phantomAddress || !phantomSession || !phantomSharedSecret || !phantomDappPublicKey) return;
    setStatus('fetching_quote');
    setErrorMsg('');
    try {
      const { swapTransaction: swapTx } = await getSwapTransactionViaBackend(
        tokenMint.trim(), solToLamports(parseFloat(amountSol)), phantomAddress
      );
      const secret = phantomSharedSecret instanceof Uint8Array
        ? phantomSharedSecret
        : deserializeSecret(phantomSharedSecret as unknown as string);

      pendingTxRef.current = { quote, amountSol };
      setStatus('waiting_sign');
      signAndSendTransaction(swapTx, phantomSession, secret, phantomDappPublicKey);
    } catch (e: any) {
      logger.error('Snipe failed', { error: e });
      setErrorMsg(e.message ?? 'Failed to build transaction');
      setStatus('error');
      pendingTxRef.current = null;
    }
  };

  const isPhantomConnected = !!(phantomAddress && phantomSession && phantomSharedSecret);

  return (
    <ScrollView
      className="flex-1 bg-primary"
      contentContainerStyle={{ paddingHorizontal: 21, paddingTop: screenHeight * 0.073, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-text-primary font-satoshi text-2xl font-bold mb-xl">Snipe</Text>

      {!isPhantomConnected && (
        <View className="bg-cards rounded-lg p-lg mb-xl">
          <Text className="text-text-muted font-satoshi text-sm text-center">
            Connect Phantom to snipe
          </Text>
        </View>
      )}

      {/* Form */}
      <View className="gap-md mb-xl">
        <View>
          <Text className="text-text-muted font-satoshi text-xs mb-sm uppercase tracking-widest">
            Token Mint Address
          </Text>
          <TextInput
            className="bg-cards rounded-lg px-lg py-md text-text-primary font-satoshi"
            placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
            placeholderTextColor="#6B6B6B"
            value={tokenMint}
            onChangeText={setTokenMint}
            autoCapitalize="none"
            autoCorrect={false}
            editable={status !== 'waiting_sign'}
          />
        </View>

        <View className="flex-row gap-md">
          <View className="flex-1">
            <Text className="text-text-muted font-satoshi text-xs mb-sm uppercase tracking-widest">
              Amount (SOL)
            </Text>
            <TextInput
              className="bg-cards rounded-lg px-lg py-md text-text-primary font-satoshi"
              placeholder="0.1"
              placeholderTextColor="#6B6B6B"
              value={amountSol}
              onChangeText={setAmountSol}
              keyboardType="decimal-pad"
              editable={status !== 'waiting_sign'}
            />
          </View>
          <View className="w-24">
            <Text className="text-text-muted font-satoshi text-xs mb-sm uppercase tracking-widest">
              Slippage %
            </Text>
            <TextInput
              className="bg-cards rounded-lg px-lg py-md text-text-primary font-satoshi"
              placeholder="3"
              placeholderTextColor="#6B6B6B"
              value={slippage}
              onChangeText={setSlippage}
              keyboardType="decimal-pad"
              editable={status !== 'waiting_sign'}
            />
          </View>
        </View>
      </View>

      {/* Quote */}
      {quote && status === 'ready' && (
        <View className="bg-cards rounded-lg p-lg mb-xl gap-sm">
          <Text className="text-text-muted font-satoshi text-xs uppercase tracking-widest mb-xs">
            Quote
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary font-satoshi text-sm">You pay</Text>
            <Text className="text-text-primary font-satoshi text-sm font-medium">
              {amountSol} SOL
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary font-satoshi text-sm">You receive (min)</Text>
            <Text className="text-text-primary font-satoshi text-sm font-medium">
              {parseInt(quote.outAmount).toLocaleString()} tokens
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary font-satoshi text-sm">Price impact</Text>
            <Text
              className={`font-satoshi text-sm font-medium ${
                parseFloat(quote.priceImpactPct) > 5 ? 'text-error' : 'text-validation'
              }`}
            >
              {parseFloat(quote.priceImpactPct).toFixed(2)}%
            </Text>
          </View>
        </View>
      )}

      {/* Error */}
      {status === 'error' && (
        <View className="bg-error/10 rounded-lg p-lg mb-xl">
          <Text className="text-error font-satoshi text-sm">{errorMsg}</Text>
        </View>
      )}

      {/* Success */}
      {status === 'success' && (
        <View className="bg-validation/10 rounded-lg p-lg mb-xl flex-row items-center gap-sm">
          <Feather name="check-circle" size={16} color="#22c55e" />
          <Text className="text-validation font-satoshi text-sm flex-1">
            Transaction sent! Check your wallet.
          </Text>
        </View>
      )}

      {/* Waiting */}
      {status === 'waiting_sign' && (
        <View className="bg-cards rounded-lg p-lg mb-xl flex-row items-center gap-sm">
          <ActivityIndicator size="small" color="#6283FA" />
          <Text className="text-text-secondary font-satoshi text-sm">
            Waiting for Phantom approval…
          </Text>
        </View>
      )}

      {/* CTA */}
      {status !== 'ready' && status !== 'waiting_sign' ? (
        <Pressable
          className={`rounded-xl py-lg items-center ${
            isPhantomConnected && tokenMint && amountSol && status !== 'fetching_quote'
              ? 'bg-accent'
              : 'bg-cards opacity-50'
          }`}
          onPress={handleFetchQuote}
          disabled={!isPhantomConnected || !tokenMint || !amountSol || status === 'fetching_quote'}
        >
          {status === 'fetching_quote' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-text-primary font-satoshi font-bold text-base">Get Quote</Text>
          )}
        </Pressable>
      ) : status === 'ready' ? (
        <View className="gap-sm">
          <Pressable
            className="bg-accent rounded-xl py-lg items-center"
            onPress={handleSnipe}
          >
            <Text className="text-text-primary font-satoshi font-bold text-base">Snipe</Text>
          </Pressable>
          <Pressable
            className="bg-cards rounded-xl py-md items-center"
            onPress={() => { setStatus('idle'); setQuote(null); }}
          >
            <Text className="text-text-muted font-satoshi text-sm">Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      {/* History */}
      {history.length > 0 && (
        <View className="mt-xl">
          <Text className="text-text-muted font-satoshi text-xs uppercase tracking-widest mb-md">
            History
          </Text>
          <View className="gap-sm">
            {history.map((item, i) => (
              <View key={i} className="bg-cards rounded-lg p-lg">
                <View className="flex-row justify-between mb-xs">
                  <Text className="text-text-primary font-satoshi text-sm font-medium">
                    {item.amountSol} SOL
                  </Text>
                  <Text className="text-validation font-satoshi text-xs">Sent</Text>
                </View>
                <Text className="text-text-muted font-satoshi text-xs" numberOfLines={1}>
                  {item.tokenMint}
                </Text>
                <Text className="text-text-muted font-satoshi text-xs mt-xs">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
