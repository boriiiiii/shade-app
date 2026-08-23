import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { connection } from './connection.js';

/**
 * Modèle non-custodial : le backend ne détient AUCUNE clé privée.
 * On lit seulement le solde du wallet connecté (pour l'affichage).
 */
export async function balanceOf(address: string): Promise<number> {
  const lamports = await connection.getBalance(new PublicKey(address));
  return lamports / LAMPORTS_PER_SOL;
}
