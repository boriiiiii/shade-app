import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

NONCE_BYTES = 12
KEY_BYTES = 32
GCM_TAG_BYTES = 16


class CryptoError(Exception):
    pass


class MissingMasterKey(CryptoError):
    pass


class DecryptError(CryptoError):
    pass


def _master_key() -> bytes:
    raw = os.getenv("SHADE_MASTER_KEY")
    if not raw:
        raise MissingMasterKey(
            "SHADE_MASTER_KEY env var not set; refuse to encrypt or decrypt"
        )
    try:
        key = base64.b64decode(raw, validate=True)
    except Exception as e:
        raise MissingMasterKey("SHADE_MASTER_KEY is not valid base64") from e
    if len(key) != KEY_BYTES:
        raise MissingMasterKey(
            f"SHADE_MASTER_KEY must decode to {KEY_BYTES} bytes (got {len(key)})"
        )
    return key


def generate_master_key_b64() -> str:
    """Helper for ops: produce a fresh master key to drop in env."""
    return base64.b64encode(os.urandom(KEY_BYTES)).decode()


def encrypt(plaintext: bytes) -> str:
    aead = AESGCM(_master_key())
    nonce = os.urandom(NONCE_BYTES)
    ct = aead.encrypt(nonce, plaintext, None)
    return base64.b64encode(nonce + ct).decode()


def decrypt(blob: str) -> bytes:
    try:
        raw = base64.b64decode(blob, validate=True)
    except Exception as e:
        raise DecryptError("ciphertext is not valid base64") from e
    if len(raw) < NONCE_BYTES + GCM_TAG_BYTES:
        raise DecryptError("ciphertext too short")
    nonce, ct = raw[:NONCE_BYTES], raw[NONCE_BYTES:]
    aead = AESGCM(_master_key())
    try:
        return aead.decrypt(nonce, ct, None)
    except Exception as e:
        raise DecryptError("authentication failed") from e
