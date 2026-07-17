"""Chargement du side wallet (le délégataire) — la SEULE clé privée détenue par Shade.

Elle ne peut dépenser que les montants explicitement approuvés on-chain par chaque utilisateur.
Formats acceptés pour `SIDE_WALLET_SECRET_KEY` :
  - base58 (export Phantom, 64 octets)
  - tableau JSON de 64 octets (export solana-keygen)
  - base58 d'une seed de 32 octets
"""
from __future__ import annotations

import json
from functools import lru_cache

import base58
from solders.keypair import Keypair

from app.core.config import settings


class SideWalletNotConfigured(RuntimeError):
    """Levée lorsqu'une opération déléguée est tentée sans side wallet configuré."""


@lru_cache
def load_side_wallet() -> Keypair:
    raw = settings.side_wallet_secret_key.strip()
    if not raw:
        raise SideWalletNotConfigured(
            "SIDE_WALLET_SECRET_KEY est vide. Génère une paire devnet : "
            "`python scripts/gen_side_wallet.py`"
        )

    if raw.startswith("["):
        data = bytes(json.loads(raw))
    else:
        data = base58.b58decode(raw)

    if len(data) == 64:
        return Keypair.from_bytes(data)
    if len(data) == 32:
        return Keypair.from_seed(data)
    raise SideWalletNotConfigured(
        f"clé side wallet invalide : {len(data)} octets (attendu 32 ou 64)"
    )


def side_wallet_pubkey() -> str:
    return str(load_side_wallet().pubkey())
