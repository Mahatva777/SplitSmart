from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.routers.groups import assert_member
from app.services.balance_service import compute_balances

router = APIRouter(tags=["balances"])


@router.get("/groups/{group_id}/balances")
def get_balances(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_member(db, group_id, current_user.id)
    return compute_balances(db, group_id)
