from solders.pubkey import Pubkey

from sniping import wallet


def test_generate_returns_valid_address_and_round_trips():
    encrypted, address = wallet.generate_side_wallet()
    Pubkey.from_string(address)  # raises if invalid
    kp = wallet.load_keypair(encrypted)
    assert str(kp.pubkey()) == address


def test_each_generation_is_unique():
    seen = set()
    for _ in range(5):
        _, addr = wallet.generate_side_wallet()
        assert addr not in seen
        seen.add(addr)
