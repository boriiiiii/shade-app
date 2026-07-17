"""Génère une paire de side wallet (devnet) et tente un airdrop de 1 SOL.

Usage (depuis la racine du repo ou depuis services/api) :
    python services/api/scripts/gen_side_wallet.py

Copie la valeur `SIDE_WALLET_SECRET_KEY` affichée dans ton `.env`.
Ne partage JAMAIS cette clé : c'est la seule clé privée détenue par le backend.
"""
from __future__ import annotations

import asyncio
import os
import sys

# Permet `import app...` quel que soit le cwd.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import base58  # noqa: E402
from solders.keypair import Keypair  # noqa: E402

from app.solana.client import SolanaClient  # noqa: E402


async def main() -> None:
    kp = Keypair()
    secret_b58 = base58.b58encode(bytes(kp)).decode()
    pubkey = str(kp.pubkey())

    print("── Side wallet devnet généré ──")
    print(f"pubkey                 : {pubkey}")
    print(f"SIDE_WALLET_SECRET_KEY : {secret_b58}")
    print()

    client = SolanaClient()
    try:
        sig = await client.request_airdrop(pubkey, 1_000_000_000)  # 1 SOL
        print(f"airdrop 1 SOL demandé  : {sig}")
        print("(Si l'airdrop est rate-limité, réessaie ou utilise https://faucet.solana.com)")
    except Exception as exc:  # noqa: BLE001
        print(f"airdrop échoué ({exc}). Alimente le wallet manuellement via un faucet devnet.")
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
