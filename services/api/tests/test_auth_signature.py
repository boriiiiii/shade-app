"""Vérification de signature Ed25519 (preuve de possession du wallet)."""
from __future__ import annotations

import base64

import base58
import nacl.signing

from app.solana.crypto import is_valid_solana_address, verify_signature


def _make_keypair() -> tuple[nacl.signing.SigningKey, str]:
    sk = nacl.signing.SigningKey.generate()
    address = base58.b58encode(bytes(sk.verify_key)).decode()
    return sk, address


def test_valid_signature_base58() -> None:
    sk, address = _make_keypair()
    message = "Shade — connexion\nNonce : abc123"
    sig = base58.b58encode(sk.sign(message.encode()).signature).decode()
    assert verify_signature(address, message, sig) is True


def test_valid_signature_base64() -> None:
    sk, address = _make_keypair()
    message = "hello world"
    sig = base64.b64encode(sk.sign(message.encode()).signature).decode()
    assert verify_signature(address, message, sig) is True


def test_wrong_message_is_rejected() -> None:
    sk, address = _make_keypair()
    sig = base58.b58encode(sk.sign(b"message A").signature).decode()
    assert verify_signature(address, "message B", sig) is False


def test_wrong_address_is_rejected() -> None:
    sk, _ = _make_keypair()
    _, other_address = _make_keypair()
    message = "same message"
    sig = base58.b58encode(sk.sign(message.encode()).signature).decode()
    assert verify_signature(other_address, message, sig) is False


def test_garbage_signature_is_rejected() -> None:
    _, address = _make_keypair()
    assert verify_signature(address, "msg", "not-a-signature") is False
    assert verify_signature(address, "msg", base58.b58encode(b"\x00" * 64).decode()) is False


def test_address_validation() -> None:
    _, address = _make_keypair()
    assert is_valid_solana_address(address) is True
    assert is_valid_solana_address("nope") is False
    assert is_valid_solana_address("") is False
