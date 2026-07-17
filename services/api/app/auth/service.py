"""Génération de nonce + message de login à signer."""
from __future__ import annotations

import secrets
from datetime import datetime


def generate_nonce() -> str:
    """Nonce imprévisible, usage unique (32 hex)."""
    return secrets.token_hex(16)


def build_login_message(wallet_address: str, nonce: str, issued_at: datetime) -> str:
    """Message humain-lisible réellement signé par le wallet (stocké tel quel, vérifié tel quel)."""
    return (
        "Shade — connexion\n\n"
        f"Wallet : {wallet_address}\n"
        f"Nonce : {nonce}\n"
        f"Émis : {issued_at.isoformat()}\n\n"
        "Signez ce message pour prouver la possession de votre wallet.\n"
        "Aucune transaction n'est effectuée, aucun fonds n'est déplacé."
    )
