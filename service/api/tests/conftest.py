"""Test bootstrap: sets a deterministic master key BEFORE any sniping module
is imported and exposes a fresh-store FastAPI app per test."""
import base64
import os
import pathlib
import sys

# Ensure imports resolve to the api/ package layout regardless of cwd.
ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Set env vars before any sniping module reads them at import time.
os.environ["SHADE_MASTER_KEY"] = base64.b64encode(b"\x01" * 32).decode()
os.environ["SHADE_DRY_RUN"] = "true"
os.environ.setdefault("SOLANA_RPC_URL", "https://api.devnet.solana.com")
os.environ.setdefault("SOLANA_NETWORK", "devnet")

import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture
def store():
    from sniping.storage import InMemoryStore

    return InMemoryStore()


@pytest.fixture
def app(store):
    from sniping.router import router
    from sniping.storage import get_store

    a = FastAPI()
    a.include_router(router)
    a.dependency_overrides[get_store] = lambda: store
    return a


@pytest.fixture
def client(app):
    return TestClient(app)
