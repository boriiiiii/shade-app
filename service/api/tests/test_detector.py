from sniping.detector import MockPoolDetector, PoolEvent


def test_detector_emits_to_subscribers():
    import asyncio

    seen: list[PoolEvent] = []

    async def cb(ev: PoolEvent) -> None:
        seen.append(ev)

    det = MockPoolDetector()
    det.subscribe(cb)
    asyncio.run(det.feed("MintAddress11111111111111111111111111111111", "PoolXyz"))

    assert len(seen) == 1
    assert seen[0].token_mint.startswith("Mint")
    assert seen[0].pool_address == "PoolXyz"


def test_detector_with_no_subscribers_is_a_noop():
    import asyncio

    det = MockPoolDetector()
    asyncio.run(det.feed("MintAddress11111111111111111111111111111111", "PoolXyz"))


def test_detector_fanout_to_multiple_subscribers():
    import asyncio

    seen_a: list[PoolEvent] = []
    seen_b: list[PoolEvent] = []

    async def cb_a(ev: PoolEvent) -> None:
        seen_a.append(ev)

    async def cb_b(ev: PoolEvent) -> None:
        seen_b.append(ev)

    det = MockPoolDetector()
    det.subscribe(cb_a)
    det.subscribe(cb_b)
    asyncio.run(det.feed("MintXyz", "PoolXyz"))

    assert len(seen_a) == len(seen_b) == 1
