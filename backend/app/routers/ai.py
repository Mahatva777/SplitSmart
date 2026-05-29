from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.routers.groups import assert_member
from app.services.ai_service import get_group_reply, get_global_reply

router = APIRouter(tags=["ai"])

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict] = []

class ChatResponse(BaseModel):
    reply: str

@router.post("/groups/{group_id}/ai/chat", response_model=ChatResponse)
def group_chat(group_id: str, body: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assert_member(db, group_id, current_user.id)
    return {"reply": get_group_reply(db, group_id, current_user, body.message, body.conversation_history)}

@router.post("/ai/chat", response_model=ChatResponse)
def global_chat(body: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"reply": get_global_reply(db, current_user, body.message, body.conversation_history)}
