"""Validation d'ordre côté serveur (le client n'est jamais cru sur parole)."""
from __future__ import annotations

import pytest

from app.core.constants import DEVNET_USDC_MINT, NATIVE_SOL_SENTINEL, WSOL_MINT
from app.orders.validation import OrderValidationError, validate_order_request

WHITELIST = [NATIVE_SOL_SENTINEL, WSOL_MINT, DEVNET_USDC_MINT]


def _req(**overrides):
    base = dict(
        input_mint=WSOL_MINT,
        output_mint=DEVNET_USDC_MINT,
        input_amount=1_000_000,
        slippage_bps=100,
        quoted_output_amount=1_000_000,
        network="devnet",
        expected_network="devnet",
        max_slippage_bps=1000,
        whitelist=WHITELIST,
    )
    base.update(overrides)
    return base


def test_valid_order_computes_authoritative_min_output() -> None:
    result = validate_order_request(**_req(slippage_bps=100, quoted_output_amount=1_000_000))
    # 1 % de slippage => min_output = 99 % du quote, calculé serveur.
    assert result.min_output_amount == 990_000
    assert result.input_amount == 1_000_000


def test_wrong_chain_rejected() -> None:
    with pytest.raises(OrderValidationError) as exc:
        validate_order_request(**_req(network="mainnet-beta"))
    assert exc.value.code == "wrong_chain"


def test_slippage_above_max_rejected() -> None:
    with pytest.raises(OrderValidationError) as exc:
        validate_order_request(**_req(slippage_bps=2000))
    assert exc.value.code == "slippage_too_high"


def test_negative_slippage_rejected() -> None:
    with pytest.raises(OrderValidationError) as exc:
        validate_order_request(**_req(slippage_bps=-1))
    assert exc.value.code == "slippage_too_high"


def test_token_not_in_whitelist_rejected() -> None:
    off_list = "Zz" + "1" * 42  # longueur d'adresse plausible, hors whitelist
    with pytest.raises(OrderValidationError) as exc:
        validate_order_request(**_req(output_mint=off_list))
    assert exc.value.code == "not_whitelisted"


def test_same_input_output_rejected() -> None:
    with pytest.raises(OrderValidationError) as exc:
        validate_order_request(**_req(output_mint=WSOL_MINT))
    assert exc.value.code == "same_mint"


def test_non_positive_amount_rejected() -> None:
    with pytest.raises(OrderValidationError) as exc:
        validate_order_request(**_req(input_amount=0))
    assert exc.value.code == "bad_amount"


def test_empty_whitelist_allows_any_valid_mint() -> None:
    # Whitelist vide => pas de restriction de token (la config peut la fournir).
    result = validate_order_request(**_req(whitelist=[]))
    assert result.min_output_amount == 990_000
