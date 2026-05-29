from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, GroupMember, Expense, ExpenseSplit, SharedAssetDetail
from app.auth import get_current_user
from app.routers.groups import assert_member

router = APIRouter(tags=["expenses"])

CATEGORIES = ["Food", "Transport", "Rent", "Entertainment", "Utilities", "Shopping", "Shared Asset", "Miscellaneous"]


# ── Schemas ───────────────────────────────────────────────────────────────────

class SharedAssetIn(BaseModel):
    asset_name: str
    purchase_cost: float
    delivery_fee: float = 0.0
    setup_fee: float = 0.0
    expected_resale_value: float = 0.0

class SharedAssetOut(BaseModel):
    asset_name: str
    purchase_cost: float
    delivery_fee: float
    setup_fee: float
    expected_resale_value: float
    total_cost: float
    net_ownership_cost: float
    per_person_estimate: float

class ExpenseCreate(BaseModel):
    title: str
    amount: float                          # ignored when is_shared_asset=True
    category: str
    notes: Optional[str] = None
    member_ids: list[str]                  # members who OWE (NOT including creator)
    is_shared_asset: bool = False
    shared_asset: Optional[SharedAssetIn] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    member_ids: Optional[list[str]] = None

class SplitOut(BaseModel):
    user_id: str
    amount_owed: float

class ExpenseOut(BaseModel):
    id: str
    group_id: str
    created_by: str
    creator_name: str
    title: str
    amount: float
    category: str
    notes: Optional[str]
    is_shared_asset: bool
    created_at: datetime
    updated_at: datetime
    splits: list[SplitOut]
    shared_asset: Optional[SharedAssetOut]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_splits(expense_id: str, member_ids: list[str], amount: float) -> list[ExpenseSplit]:
    """Equal split with last-item rounding correction to avoid float drift."""
    n = len(member_ids)
    if n == 0:
        return []
    base = round(amount / n, 2)
    splits = []
    for i, uid in enumerate(member_ids):
        amt = base if i < n - 1 else round(amount - base * (n - 1), 2)
        splits.append(ExpenseSplit(expense_id=expense_id, user_id=uid, amount_owed=amt))
    return splits

def _serialize(exp: Expense) -> ExpenseOut:
    sa = exp.shared_asset
    return ExpenseOut(
        id=exp.id, group_id=exp.group_id, created_by=exp.created_by,
        creator_name=exp.creator.name, title=exp.title, amount=float(exp.amount),
        category=exp.category, notes=exp.notes, is_shared_asset=exp.is_shared_asset,
        created_at=exp.created_at, updated_at=exp.updated_at,
        splits=[SplitOut(user_id=s.user_id, amount_owed=float(s.amount_owed)) for s in exp.splits],
        shared_asset=SharedAssetOut(
            asset_name=sa.asset_name,
            purchase_cost=float(sa.purchase_cost),
            delivery_fee=float(sa.delivery_fee),
            setup_fee=float(sa.setup_fee),
            expected_resale_value=float(sa.expected_resale_value),
            total_cost=float(sa.total_cost),
            net_ownership_cost=float(sa.net_ownership_cost),
            per_person_estimate=float(sa.per_person_estimate),
        ) if sa else None,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/groups/{group_id}/expenses", response_model=list[ExpenseOut])
def list_expenses(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_member(db, group_id, current_user.id)
    exps = db.query(Expense).filter_by(group_id=group_id).order_by(Expense.created_at.desc()).all()
    return [_serialize(e) for e in exps]


@router.post("/groups/{group_id}/expenses", response_model=ExpenseOut, status_code=201)
def create_expense(group_id: str, body: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_member(db, group_id, current_user.id)

    if body.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Choose from: {CATEGORIES}")

    # Validate every member_id is an active group member
    for uid in body.member_ids:
        if not db.query(GroupMember).filter_by(group_id=group_id, user_id=uid, is_active=True).first():
            raise HTTPException(status_code=400, detail=f"User {uid} is not an active member of this group")

    # Shared Asset: derive amount from asset cost breakdown
    if body.is_shared_asset:
        if not body.shared_asset:
            raise HTTPException(status_code=400, detail="shared_asset details required when is_shared_asset=True")
        sa = body.shared_asset
        total_cost = sa.purchase_cost + sa.delivery_fee + sa.setup_fee
        amount = total_cost
    else:
        amount = body.amount

    exp = Expense(
        group_id=group_id, created_by=current_user.id,
        title=body.title.strip(), amount=amount,
        category=body.category, notes=body.notes,
        is_shared_asset=body.is_shared_asset,
    )
    db.add(exp)
    db.flush()  # get exp.id without committing

    db.add_all(_make_splits(exp.id, body.member_ids, amount))

    if body.is_shared_asset:
        sa = body.shared_asset
        total_cost = sa.purchase_cost + sa.delivery_fee + sa.setup_fee
        net = total_cost - sa.expected_resale_value
        per_person = round(net / max(len(body.member_ids), 1), 2)
        db.add(SharedAssetDetail(
            expense_id=exp.id, asset_name=sa.asset_name,
            purchase_cost=sa.purchase_cost, delivery_fee=sa.delivery_fee,
            setup_fee=sa.setup_fee, expected_resale_value=sa.expected_resale_value,
            total_cost=total_cost, net_ownership_cost=net, per_person_estimate=per_person,
        ))

    db.commit()
    db.refresh(exp)
    return _serialize(exp)


@router.get("/groups/{group_id}/expenses/{expense_id}", response_model=ExpenseOut)
def get_expense(group_id: str, expense_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_member(db, group_id, current_user.id)
    exp = db.query(Expense).filter_by(id=expense_id, group_id=group_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    return _serialize(exp)


@router.put("/groups/{group_id}/expenses/{expense_id}", response_model=ExpenseOut)
def update_expense(group_id: str, expense_id: str, body: ExpenseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exp = db.query(Expense).filter_by(id=expense_id, group_id=group_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    if exp.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the expense creator can edit it")

    if body.title is not None:
        exp.title = body.title.strip()
    if body.category is not None:
        if body.category not in CATEGORIES:
            raise HTTPException(status_code=400, detail="Invalid category")
        exp.category = body.category
    if body.notes is not None:
        exp.notes = body.notes

    # Recalculate splits if amount or member_ids changed
    if body.amount is not None or body.member_ids is not None:
        new_amount = body.amount if body.amount is not None else float(exp.amount)
        new_member_ids = body.member_ids if body.member_ids is not None else [s.user_id for s in exp.splits]

        if body.amount is not None:
            exp.amount = new_amount

        for s in list(exp.splits):
            db.delete(s)
        db.flush()
        db.add_all(_make_splits(exp.id, new_member_ids, new_amount))

    db.commit()
    db.refresh(exp)
    return _serialize(exp)


@router.delete("/groups/{group_id}/expenses/{expense_id}")
def delete_expense(group_id: str, expense_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exp = db.query(Expense).filter_by(id=expense_id, group_id=group_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    if exp.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the expense creator can delete it")
    db.delete(exp)
    db.commit()
    return {"message": "Expense deleted"}
