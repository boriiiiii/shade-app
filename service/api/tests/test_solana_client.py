from sniping import solana_client


def test_valid_known_addresses():
    # System program and Wrapped SOL mint — both real, both should validate.
    assert solana_client.is_valid_solana_address("11111111111111111111111111111111")
    assert solana_client.is_valid_solana_address(
        "So11111111111111111111111111111111111111112"
    )


def test_invalid_addresses():
    assert not solana_client.is_valid_solana_address("")
    assert not solana_client.is_valid_solana_address("not-base58-at-all-!!!")
    assert not solana_client.is_valid_solana_address("0xabc")  # EVM address
    assert not solana_client.is_valid_solana_address(None)  # type: ignore[arg-type]
    # too short
    assert not solana_client.is_valid_solana_address("abc")


def test_get_balance_rejects_invalid_address():
    import pytest

    with pytest.raises(solana_client.SolanaClientError):
        solana_client.get_balance_lamports("https://example.invalid", "garbage")
