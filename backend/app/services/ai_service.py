import json
from sqlalchemy.orm import Session
from app.models import User, Group, GroupMember, Expense, Settlement
from app.services.balance_service import compute_balances
from app.config import settings

SYSTEM_PROMPT_BASE = """You are a financial assistant inside SplitSmart, a shared expense app.
You have access to ONLY the data provided below. Do not invent numbers, names, or transactions
that are not in this data. If you cannot answer from the data, say so clearly.
Answer concisely in plain text or short bullet points. Max 150 words unless asked for more.
Do not give generic financial advice. Do not suggest investment strategies."""

def _call_gemini(system_prompt: str, message: str, history: list[dict]) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=system_prompt)
        chat_history = [
            {"role": h["role"], "parts": [h["content"]]}
            for h in history if h.get("role") in ("user", "model")
        ]
        chat = model.start_chat(history=chat_history)
        return chat.send_message(message).text
    except Exception as e:
        return f"AI assistant unavailable: {e}"

def _group_data(db: Session, group_id: str, current_user: User) -> str:
    group = db.query(Group).filter_by(id=group_id).first()
    members = db.query(GroupMember).filter_by(group_id=group_id).all()
    user_map = {m.user_id: m.user.name for m in members}

    expenses = [
        {
            "title": e.title, "amount": float(e.amount), "category": e.category,
            "paid_by": user_map.get(e.created_by, "Unknown"),
            "split_among": [user_map.get(s.user_id, "Unknown") for s in e.splits],
            "date": e.created_at.strftime("%Y-%m-%d"),
            "is_shared_asset": e.is_shared_asset,
        }
        for e in db.query(Expense).filter_by(group_id=group_id).order_by(Expense.created_at.desc()).all()
    ]
    settlements = [
        {
            "from": user_map.get(s.payer_id, "Unknown"),
            "to": user_map.get(s.payee_id, "Unknown"),
            "amount": float(s.amount), "date": s.created_at.strftime("%Y-%m-%d"),
        }
        for s in db.query(Settlement).filter_by(group_id=group_id).all()
    ]
    balances = compute_balances(db, group_id)

    return json.dumps({
        "group": group.name,
        "current_user": current_user.name,
        "members": list(user_map.values()),
        "expenses": expenses,
        "settlements": settlements,
        "net_balances": balances["net_balances"],
        "pairwise_balances": balances["pairwise"],
    }, indent=2)

def _global_data(db: Session, current_user: User) -> str:
    memberships = db.query(GroupMember).filter_by(user_id=current_user.id, is_active=True).all()
    groups_summary = []
    total_owed = 0.0
    total_owing = 0.0

    for m in memberships:
        group = db.query(Group).filter_by(id=m.group_id).first()
        if not group:
            continue
        balances = compute_balances(db, m.group_id)
        user_net = next((b["net"] for b in balances["net_balances"] if b["user_id"] == current_user.id), 0.0)
        if user_net > 0: total_owed += user_net
        elif user_net < 0: total_owing += abs(user_net)

        category_totals: dict[str, float] = {}
        for e in db.query(Expense).filter_by(group_id=m.group_id).all():
            category_totals[e.category] = category_totals.get(e.category, 0) + float(e.amount)

        groups_summary.append({
            "group": group.name,
            "your_net_balance": round(user_net, 2),
            "category_totals": category_totals,
        })

    return json.dumps({
        "user": current_user.name,
        "total_others_owe_you": round(total_owed, 2),
        "total_you_owe_others": round(total_owing, 2),
        "groups": groups_summary,
    }, indent=2)

def get_group_reply(db: Session, group_id: str, current_user: User, message: str, history: list[dict]) -> str:
    data = _group_data(db, group_id, current_user)
    prompt = f"{SYSTEM_PROMPT_BASE}\n\n=== GROUP DATA ===\n{data}\n================="
    return _call_gemini(prompt, message, history)

def get_global_reply(db: Session, current_user: User, message: str, history: list[dict]) -> str:
    data = _global_data(db, current_user)
    prompt = f"{SYSTEM_PROMPT_BASE}\n\n=== USER DATA ===\n{data}\n================"
    return _call_gemini(prompt, message, history)
