"""
Tiny Solana RPC wrapper. Network IO is minimal and confined to here so the
rest of the module stays unit-testable. The send-transaction / swap path is
intentionally NOT implemented yet — see engine.py for the dry-run path.
"""
import json
from urllib import error as urlerror
from urllib import request

from solders.pubkey import Pubkey


class SolanaClientError(Exception):
    pass


def is_valid_solana_address(address: str) -> bool:
    if not isinstance(address, str) or not address:
        return False
    try:
        Pubkey.from_string(address)
        return True
    except Exception:
        return False


def get_balance_lamports(rpc_url: str, address: str, *, timeout: float = 10.0) -> int:
    """Fetch the lamport balance of an address. Raises on RPC or network error."""
    if not is_valid_solana_address(address):
        raise SolanaClientError(f"invalid address: {address}")
    body = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [address],
        }
    ).encode()
    req = request.Request(
        rpc_url, data=body, headers={"Content-Type": "application/json"}
    )
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
    except (urlerror.URLError, TimeoutError, OSError) as e:
        raise SolanaClientError(f"RPC request failed: {e}") from e
    if "error" in data:
        raise SolanaClientError(f"RPC returned error: {data['error']}")
    try:
        return int(data["result"]["value"])
    except (KeyError, TypeError, ValueError) as e:
        raise SolanaClientError(f"unexpected RPC response: {data}") from e
