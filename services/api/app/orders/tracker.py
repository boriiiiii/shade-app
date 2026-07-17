"""Suivi on-chain de l'état d'un ordre (polling des statuts de signature devnet)."""
from __future__ import annotations

from app.core.constants import OrderStatus
from app.db.models import Order
from app.solana.client import SolanaClient


async def refresh_order_status(order: Order) -> Order:
    """Met à jour `order.status` d'après l'état on-chain de sa transaction (mutation en place)."""
    if not order.tx_signature or order.status != OrderStatus.pending.value:
        return order

    client = SolanaClient()
    try:
        st = await client.get_signature_status(order.tx_signature)
    finally:
        await client.close()

    if st.status == "success":
        order.status = OrderStatus.success.value
        if order.realized_pnl is None:
            order.realized_pnl = 0  # devnet : PnL réalisé indisponible sans DEX réel
    elif st.status == "failed":
        order.status = OrderStatus.failed.value
        order.failure_reason = st.err or "transaction échouée on-chain"
    # sinon : encore pending, on ne touche à rien.
    return order
