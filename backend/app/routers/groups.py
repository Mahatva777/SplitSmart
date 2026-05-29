from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User, Group, GroupMember
from app.auth import get_current_user
from app.services.balance_service import compute_balances

router = APIRouter(prefix="/groups", tags=["groups"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class AddMemberRequest(BaseModel):
    email: str

class MemberOut(BaseModel):
    user_id: str
    name: str
    email: str
    joined_at: datetime
    is_active: bool

class GroupOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_by: str
    created_at: datetime
    members: list[MemberOut]


# ── Helpers ───────────────────────────────────────────────────────────────────

def assert_member(db: Session, group_id: str, user_id: str) -> GroupMember:
    m = db.query(GroupMember).filter_by(group_id=group_id, user_id=user_id, is_active=True).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    return m

def serialize_group(group: Group) -> GroupOut:
    members = [
        MemberOut(
            user_id=m.user_id, name=m.user.name, email=m.user.email,
            joined_at=m.joined_at, is_active=m.is_active,
        )
        for m in group.members
    ]
    return GroupOut(
        id=group.id, name=group.name, description=group.description,
        created_by=group.created_by, created_at=group.created_at,
        members=members,
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[GroupOut])
def list_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memberships = db.query(GroupMember).filter_by(user_id=current_user.id, is_active=True).all()
    groups = [db.query(Group).filter_by(id=m.group_id).first() for m in memberships]
    return [serialize_group(g) for g in groups if g]


@router.post("", response_model=GroupOut, status_code=201)
def create_group(body: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = Group(name=body.name.strip(), description=body.description, created_by=current_user.id)
    db.add(group)
    db.flush()
    db.add(GroupMember(group_id=group.id, user_id=current_user.id))
    db.commit()
    db.refresh(group)
    return serialize_group(group)


@router.get("/{group_id}", response_model=GroupOut)
def get_group(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_member(db, group_id, current_user.id)
    group = db.query(Group).filter_by(id=group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return serialize_group(group)


@router.put("/{group_id}", response_model=GroupOut)
def update_group(group_id: str, body: GroupUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = db.query(Group).filter_by(id=group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the group creator can update it")
    if body.name is not None:
        group.name = body.name.strip()
    if body.description is not None:
        group.description = body.description
    db.commit()
    db.refresh(group)
    return serialize_group(group)


@router.delete("/{group_id}")
def delete_group(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = db.query(Group).filter_by(id=group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if group.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Only the group creator can delete it")
    result = compute_balances(db, group_id)
    if any(abs(b["net"]) > 0.01 for b in result["net_balances"]):
        raise HTTPException(status_code=400, detail="Cannot delete group with unsettled balances")
    db.delete(group)
    db.commit()
    return {"message": "Group deleted"}


@router.post("/{group_id}/members")
def add_member(group_id: str, body: AddMemberRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_member(db, group_id, current_user.id)
    target = db.query(User).filter_by(email=body.email.lower()).first()
    if not target:
        raise HTTPException(status_code=404, detail="No account found with that email")
    existing = db.query(GroupMember).filter_by(group_id=group_id, user_id=target.id).first()
    if existing:
        if existing.is_active:
            raise HTTPException(status_code=400, detail="User is already a member")
        existing.is_active = True
        db.commit()
        return {"message": "Member re-added"}
    db.add(GroupMember(group_id=group_id, user_id=target.id))
    db.commit()
    return {"message": "Member added"}


@router.delete("/{group_id}/members/{user_id}")
def remove_member(group_id: str, user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Users can remove themselves; only creator can remove others
    if user_id != current_user.id:
        group = db.query(Group).filter_by(id=group_id).first()
        if not group or group.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Only the group creator can remove other members")
    member = db.query(GroupMember).filter_by(group_id=group_id, user_id=user_id, is_active=True).first()
    if not member:
        raise HTTPException(status_code=404, detail="Active member not found")
    member.is_active = False
    db.commit()
    return {"message": "Removed from group"}
