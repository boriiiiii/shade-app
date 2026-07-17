"""Quote de prix.

MVP devnet : la liquidité DEX (Jupiter/Orca) n'est pas fiable sur devnet, on renvoie donc un
quote placeholder 1:1. Point d'intégration clairement identifié : brancher ici l'API Jupiter
(`/quote`) en mainnet/staging. Le reste du pipeline (validation du slippage, min_output
autoritatif, tracking) est indépendant de la source du quote.
"""
from __future__ import annotations


async def get_quote(input_mint: str, output_mint: str, input_amount: int) -> int:
    """Renvoie le montant de sortie estimé (base units). Placeholder devnet 1:1."""
    # TODO(mainnet): remplacer par un appel Jupiter `/quote` et renvoyer `outAmount`.
    return input_amount
