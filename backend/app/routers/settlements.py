from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Settlement
from app.auth import get_current_user
from app.routers.groups import assert_member

router = APIRouter(tags=["settlements"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class SettlementCreate(BaseModel):
    payee_id: str       # person receiving the payment
    amount: float
    note: Optional[str] = None

class SettlementOut(BaseModel):
    id: str
    group_id: str
    payer_id: str
    payer_name: str
    payee_id: str
    payee_name: str
    amount: float
    note: Optional[str]
    created_at: datetime


# ── Helper ────────────────────────────────────────────────────────────────────

def _serialize(s: Settlement) -> SettlementOut:
    return SettlementOut(
        id=s.id, group_id=s.group_id,
        payer_id=s.payer_id, payer_name=s.payer.name,
        payee_id=s.payee_id, payee_name=s.payee.name,
        amount=float(s.amount), note=s.note, created_at=s.created_at,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/groups/{group_id}/settlements", response_model=list[SettlementOut])
def list_settlements(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_member(db, group_id, current_user.id)
    settlements = (
        db.query(Settlement)
        .filter_by(group_id=group_id)
        .order_by(Settlement.created_at.desc())
        .all()
    )
    return [_serialize(s) for s in settlements]


@router.post("/groups/{group_id}/settlements", response_model=SettlementOut, status_code=201)
def create_settlement(
    group_id: str,
    body: SettlementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_member(db, group_id, current_user.id)

    if body.payee_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot settle with yourself")

    # payee must also be a (current or past) member of the group
    assert_member(db, group_id, body.payee_id)

    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    s = Settlement(
        group_id=group_id,
        payer_id=current_user.id,
        payee_id=body.payee_id,
        amount=body.amount,
        note=body.note,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _serialize(s)
