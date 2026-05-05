from solders.keypair import Keypair

from . import crypto


def generate_side_wallet() -> tuple[str, str]:
    """Create a fresh Solana keypair. Returns (encrypted_secret_b64, public_address_base58)."""
    kp = Keypair()
    encrypted = crypto.encrypt(bytes(kp))
    return encrypted, str(kp.pubkey())


def load_keypair(encrypted_secret: str) -> Keypair:
    """Decrypt and rehydrate a keypair. Raises crypto.DecryptError on tamper."""
    return Keypair.from_bytes(crypto.decrypt(encrypted_secret))
