from fastapi import APIRouter, Depends, HTTPException

from . import engine
from . import permit as permit_mod
from . import solana_client, wallet
from .config import load_config
from .permit import Permit
from .schemas import (
    CreatePermitRequest,
    CreateSideWalletRequest,
    DryRunSnipeRequest,
    PermitResponse,
    SideWalletResponse,
    SnipeResponse,
)
from .storage import InMemoryStore, StorageError, get_store

router = APIRouter(prefix="/sniping", tags=["sniping"])


def _validate_address(addr: str, label: str) -> None:
    if not solana_client.is_valid_solana_address(addr):
        raise HTTPException(400, f"invalid solana {label}: {addr}")


def _serialize_permit(p: Permit) -> PermitResponse:
    return PermitResponse(
        id=p.id,
        user_wallet=p.user_wallet,
        side_wallet_address=p.side_wallet_address,
        mode=p.mode,
        budget_lamports_max=p.budget_lamports_max,
        budget_lamports_used=p.budget_lamports_used,
        expires_at=p.expires_at.isoformat() if p.expires_at else None,
        revoked_at=p.revoked_at.isoformat() if p.revoked_at else None,
        created_at=p.created_at.isoformat(),
        is_active=permit_mod.is_active(p),
    )


@router.post("/wallet", response_model=SideWalletResponse)
def create_side_wallet(
    req: CreateSideWalletRequest, store: InMemoryStore = Depends(get_store)
):
    _validate_address(req.user_wallet, "user wallet")
    if store.get_side_wallet(req.user_wallet) is not None:
        raise HTTPException(409, "side wallet already exists for this user")
    encrypted, address = wallet.generate_side_wallet()
    store.create_side_wallet(req.user_wallet, address, encrypted)
    return SideWalletResponse(user_wallet=req.user_wallet, deposit_address=address)


@router.get("/wallet", response_model=SideWalletResponse)
def read_side_wallet(user: str, store: InMemoryStore = Depends(get_store)):
    sw = store.get_side_wallet(user)
    if sw is None:
        raise HTTPException(404, "no side wallet for this user")
    cfg = load_config()
    balance: int | None
    try:
        balance = solana_client.get_balance_lamports(cfg.rpc_url, sw["address"])
    except solana_client.SolanaClientError:
        balance = None
    return SideWalletResponse(
        user_wallet=user, deposit_address=sw["address"], balance_lamports=balance
    )


@router.post("/permit", response_model=PermitResponse)
def create_permit(
    req: CreatePermitRequest, store: InMemoryStore = Depends(get_store)
):
    _validate_address(req.user_wallet, "user wallet")
    sw = store.get_side_wallet(req.user_wallet)
    if sw is None:
        raise HTTPException(
            400, "no side wallet — create one first via POST /sniping/wallet"
        )
    try:
        p = permit_mod.new_permit(
            user_wallet=req.user_wallet,
            side_wallet_address=sw["address"],
            mode=req.mode,
            budget_lamports_max=req.budget_lamports_max,
            duration_seconds=req.duration_seconds,
        )
    except permit_mod.PermitError as e:
        raise HTTPException(400, str(e))
    store.save_permit(p)
    return _serialize_permit(p)


@router.get("/permits", response_model=list[PermitResponse])
def list_permits(user: str, store: InMemoryStore = Depends(get_store)):
    return [_serialize_permit(p) for p in store.list_permits(user)]


@router.delete("/permit/{permit_id}", response_model=PermitResponse)
def revoke_permit(permit_id: str, store: InMemoryStore = Depends(get_store)):
    try:
        p = store.revoke_permit(permit_id)
    except StorageError:
        raise HTTPException(404, "permit not found")
    return _serialize_permit(p)


@router.post("/snipe/dryrun", response_model=SnipeResponse)
def snipe_dryrun(
    req: DryRunSnipeRequest, store: InMemoryStore = Depends(get_store)
):
    cfg = load_config()
    if not cfg.dry_run:
        raise HTTPException(
            400,
            "SHADE_DRY_RUN is disabled — refusing this endpoint outside dry-run mode",
        )
    try:
        rec = engine.try_snipe(
            store, req.permit_id, req.token_mint, req.amount_lamports, dry_run=True
        )
    except (permit_mod.BudgetExceeded, permit_mod.PermitInactive) as e:
        raise HTTPException(403, str(e))
    except permit_mod.PermitError as e:
        raise HTTPException(400, str(e))
    except StorageError as e:
        raise HTTPException(404, str(e))
    except engine.SnipeError as e:
        raise HTTPException(400, str(e))
    return SnipeResponse(**rec)


@router.get("/snipes")
def list_snipes(user: str, store: InMemoryStore = Depends(get_store)):
    return store.list_snipes(user)
