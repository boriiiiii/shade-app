"""
Pool detector — abstract base + a mock for tests.

The real Raydium / pump.fun detector belongs here once the streaming infra
(Helius / Geyser / WebSocket) is chosen. By design, detection is decoupled
from execution: a detector emits PoolEvent objects to subscribers, and the
caller decides whether to fire a snipe.
"""
import asyncio
import time
from dataclasses import dataclass
from typing import Awaitable, Callable


@dataclass(frozen=True)
class PoolEvent:
    token_mint: str
    pool_address: str
    detected_at: float
    raw: dict


PoolCallback = Callable[[PoolEvent], Awaitable[None]]


class PoolDetector:
    def __init__(self) -> None:
        self._subscribers: list[PoolCallback] = []

    def subscribe(self, cb: PoolCallback) -> None:
        self._subscribers.append(cb)

    async def emit(self, event: PoolEvent) -> None:
        if not self._subscribers:
            return
        await asyncio.gather(*(cb(event) for cb in self._subscribers))


class MockPoolDetector(PoolDetector):
    """Test helper: feeds scripted events through emit()."""

    async def feed(self, token_mint: str, pool_address: str, raw: dict | None = None) -> None:
        await self.emit(
            PoolEvent(
                token_mint=token_mint,
                pool_address=pool_address,
                detected_at=time.time(),
                raw=raw or {},
            )
        )
