"""Helpers de construction de transactions Solana (legacy) via solders."""
from __future__ import annotations

import base64
from collections.abc import Sequence

from solders.hash import Hash
from solders.instruction import Instruction
from solders.keypair import Keypair
from solders.message import Message
from solders.pubkey import Pubkey
from solders.transaction import Transaction


def build_unsigned_tx_b64(
    instructions: Sequence[Instruction],
    payer: Pubkey,
    blockhash: str,
) -> str:
    """Transaction NON signée, sérialisée en base64.

    Destinée à être renvoyée au wallet de l'utilisateur, qui la désérialise, la signe et la
    diffuse. Le backend ne signe jamais à la place de l'utilisateur.
    """
    message = Message.new_with_blockhash(list(instructions), payer, Hash.from_string(blockhash))
    tx = Transaction.new_unsigned(message)
    return base64.b64encode(bytes(tx)).decode("ascii")


def build_signed_tx_bytes(
    instructions: Sequence[Instruction],
    signers: Sequence[Keypair],
    payer: Pubkey,
    blockhash: str,
) -> bytes:
    """Transaction signée (par le side wallet) prête à être broadcastée.

    Utilisée uniquement pour les exécutions déléguées (Degen / Full Trust), où le side wallet
    agit comme *delegate* dans les limites approuvées on-chain — jamais avec la clé utilisateur.
    """
    message = Message.new_with_blockhash(list(instructions), payer, Hash.from_string(blockhash))
    tx = Transaction(list(signers), message, Hash.from_string(blockhash))
    return bytes(tx)
