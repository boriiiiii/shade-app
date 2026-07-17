"""Vérification de signature Ed25519 Solana (preuve de possession du wallet).

Une adresse Solana EST une clé publique Ed25519 encodée en base58 (32 octets). On vérifie donc
directement la signature du message contre cette clé, sans jamais toucher à une clé privée.
"""
from __future__ import annotations

import base64

import base58
import nacl.exceptions
import nacl.signing


def is_valid_solana_address(address: str) -> bool:
    """Vrai si `address` est une clé publique Solana valide (base58, 32 octets)."""
    try:
        raw = base58.b58decode(address)
    except Exception:
        return False
    return len(raw) == 32


def _decode_signature(signature: str) -> bytes:
    """Décode une signature 64 octets. Accepte base58 (convention Phantom) puis base64."""
    last_err: Exception | None = None
    for decoder in (base58.b58decode, base64.b64decode):
        try:
            raw = decoder(signature)
        except Exception as exc:  # noqa: BLE001 — on tente le décodeur suivant
            last_err = exc
            continue
        if len(raw) == 64:
            return raw
    raise ValueError(
        "signature invalide : attendue 64 octets encodés en base58 ou base64"
    ) from last_err


def verify_signature(address: str, message: str, signature: str) -> bool:
    """Vérifie que `signature` du `message` (UTF-8) provient bien de `address`.

    Retourne un booléen (jamais d'exception) — appelé sur des entrées non fiables.
    """
    try:
        pubkey_bytes = base58.b58decode(address)
        if len(pubkey_bytes) != 32:
            return False
        sig_bytes = _decode_signature(signature)
        verify_key = nacl.signing.VerifyKey(pubkey_bytes)
        # .verify lève BadSignatureError si la signature ne correspond pas.
        verify_key.verify(message.encode("utf-8"), sig_bytes)
        return True
    except (nacl.exceptions.BadSignatureError, ValueError):
        return False
    except Exception:  # noqa: BLE001 — toute entrée malformée => non vérifiée
        return False
