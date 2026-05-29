from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Group, GroupMember, Expense, Settlement
from app.auth import get_current_user
from app.routers.groups import assert_member

router = APIRouter(tags=["activity"])


# ── Schema ────────────────────────────────────────────────────────────────────

class ActivityItem(BaseModel):
    type: str               # "expense" | "settlement"
    id: str
    description: str        # human-readable summary
    amount: float
    created_at: datetime
    group_id: str
    group_name: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _from_expense(exp: Expense, group_name: Optional[str] = None) -> ActivityItem:
    return ActivityItem(
        type="expense",
        id=exp.id,
        description=f"{exp.creator.name} paid for {exp.title}",
        amount=float(exp.amount),
        created_at=exp.created_at,
        group_id=exp.group_id,
        group_name=group_name,
    )

def _from_settlement(s: Settlement, group_name: Optional[str] = None) -> ActivityItem:
    return ActivityItem(
        type="settlement",
        id=s.id,
        description=f"{s.payer.name} paid {s.payee.name}",
        amount=float(s.amount),
        created_at=s.created_at,
        group_id=s.group_id,
        group_name=group_name,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/groups/{group_id}/activity", response_model=list[ActivityItem])
def group_activity(
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Merged, time-sorted feed for a single group."""
    assert_member(db, group_id, current_user.id)

    items: list[ActivityItem] = []

    for exp in db.query(Expense).filter_by(group_id=group_id).all():
        items.append(_from_expense(exp))

    for s in db.query(Settlement).filter_by(group_id=group_id).all():
        items.append(_from_settlement(s))

    return sorted(items, key=lambda x: x.created_at, reverse=True)


@router.get("/dashboard/activity", response_model=list[ActivityItem])
def dashboard_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Recent activity across all groups the user belongs to. Capped at 50 items."""
    memberships = db.query(GroupMember).filter_by(user_id=current_user.id, is_active=True).all()
    group_ids = [m.group_id for m in memberships]

    if not group_ids:
        return []

    group_names = {
        g.id: g.name
        for g in db.query(Group).filter(Group.id.in_(group_ids)).all()
    }

    items: list[ActivityItem] = []

    for exp in db.query(Expense).filter(Expense.group_id.in_(group_ids)).all():
        items.append(_from_expense(exp, group_names.get(exp.group_id)))

    for s in db.query(Settlement).filter(Settlement.group_id.in_(group_ids)).all():
        items.append(_from_settlement(s, group_names.get(s.group_id)))

    return sorted(items, key=lambda x: x.created_at, reverse=True)[:50]
