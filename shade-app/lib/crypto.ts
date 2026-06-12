/**
 * Utilitaires crypto : lecture de soldes on-chain et formatage d'adresses.
 *
 * Les soldes sont lus via de simples appels JSON-RPC publics, sans dépendance
 * lourde (@solana/web3.js, ethers…). Les endpoints sont surchargables par
 * variables d'environnement.
 */

import { logger } from "@/lib/logger";

const SOLANA_RPC =
  process.env.EXPO_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const ETH_RPC =
  process.env.EXPO_PUBLIC_ETH_RPC || "https://cloudflare-eth.com";

const LAMPORTS_PER_SOL = 1_000_000_000; // 1e9
const WEI_PER_ETH = 1_000_000_000_000_000_000n; // 1e18

/** Valeur retournée en cas de solde nul ou d'erreur (sentinelle attendue par l'UI). */
const ZERO = "0.0";

/** Effectue un appel JSON-RPC POST et retourne le champ `result`. */
async function rpcCall(
  url: string,
  method: string,
  params: unknown[]
): Promise<any> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!response.ok) throw new Error(`RPC ${method}: HTTP ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`);
  return json.result;
}

/**
 * Retourne le solde SOL d'une adresse Solana, en unités de SOL.
 * Renvoie "0.0" en cas de solde nul ou d'erreur.
 */
export async function getSolBalance(address: string): Promise<string> {
  try {
    const result = await rpcCall(SOLANA_RPC, "getBalance", [address]);
    const lamports: number = result?.value ?? 0;
    if (!lamports) return ZERO;
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  } catch (e) {
    logger.error("getSolBalance failed", { error: e });
    return ZERO;
  }
}

/**
 * Retourne le solde ETH d'une adresse EVM, en unités d'ETH.
 * Renvoie "0.0" en cas de solde nul ou d'erreur.
 */
export async function getEthBalance(address: string): Promise<string> {
  try {
    const hexWei: string = await rpcCall(ETH_RPC, "eth_getBalance", [
      address,
      "latest",
    ]);
    const wei = BigInt(hexWei ?? "0x0");
    if (wei === 0n) return ZERO;
    // Conversion en ETH avec 4 décimales sans perdre la précision des grands nombres.
    const whole = wei / WEI_PER_ETH;
    const frac = ((wei % WEI_PER_ETH) * 10_000n) / WEI_PER_ETH;
    return `${whole}.${frac.toString().padStart(4, "0")}`;
  } catch (e) {
    logger.error("getEthBalance failed", { error: e });
    return ZERO;
  }
}

/**
 * Raccourcit une adresse pour l'affichage : "0x1234...abcd".
 * @param chars Nombre de caractères conservés de chaque côté (défaut 4).
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
