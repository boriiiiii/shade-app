import { Connection } from '@solana/web3.js';
import { config } from '../config.js';

/**
 * Connexion Solana partagée. On fournit explicitement wsEndpoint pour que
 * les souscriptions temps réel (onLogs) utilisent le bon WebSocket RPC.
 */
export const connection = new Connection(config.rpcUrl, {
  commitment: 'confirmed',
  wsEndpoint: config.wsUrl,
});

/** Construit un lien Solana Explorer (avec suffixe cluster si devnet). */
export function explorerTx(signature: string): string {
  const suffix = config.explorerCluster ? `?cluster=${config.explorerCluster}` : '';
  return `https://explorer.solana.com/tx/${signature}${suffix}`;
}

export function explorerAddress(address: string): string {
  const suffix = config.explorerCluster ? `?cluster=${config.explorerCluster}` : '';
  return `https://explorer.solana.com/address/${address}${suffix}`;
}
