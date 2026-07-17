import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { SOLANA_CLUSTER } from "./env";

// Single shared devnet connection used by the app-side signer (dev signer broadcast,
// airdrops, balance reads). The backend has its own RPC client; this one only serves the
// non-custodial app-side actions (signing + broadcasting the user's own transactions).
let _connection: Connection | null = null;

export function getConnection(): Connection {
  if (_connection === null) {
    _connection = new Connection(clusterApiUrl(SOLANA_CLUSTER), "confirmed");
  }
  return _connection;
}

/** Balance (lamports) of an arbitrary address on the configured cluster. */
export async function getLamportBalance(address: string): Promise<number> {
  const pubkey = new PublicKey(address);
  return getConnection().getBalance(pubkey, "confirmed");
}
