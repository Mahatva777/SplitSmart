from collections import defaultdict
from sqlalchemy.orm import Session
from app.models import Expense, ExpenseSplit, Settlement, GroupMember, User


def compute_balances(db: Session, group_id: str) -> dict:
    """
    Pure function. Returns:
      net_balances  — list of {user_id, name, net}
                      positive = others owe you, negative = you owe others
      pairwise      — list of {from_user_id, from_name, to_user_id, to_name, amount}
                      only non-zero entries, canonical direction (from owes to)
    """
    # All members ever in this group (active or not) — needed to map old expenses
    all_members = db.query(GroupMember).filter_by(group_id=group_id).all()
    all_user_ids = {m.user_id for m in all_members}
    user_map: dict[str, str] = {
        u.id: u.name
        for u in db.query(User).filter(User.id.in_(all_user_ids)).all()
    }

    # owes[A][B] = gross amount A owes B (from expense splits only, before settlements)
    owes: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))

    for exp in db.query(Expense).filter_by(group_id=group_id).all():
        for split in exp.splits:
            owes[split.user_id][exp.created_by] += float(split.amount_owed)

    # Subtract settlements (safe even if settlements table is empty)
    for s in db.query(Settlement).filter_by(group_id=group_id).all():
        owes[s.payer_id][s.payee_id] -= float(s.amount)

    # Net balance per member: what others owe you minus what you owe others
    net: dict[str, float] = defaultdict(float)
    seen_pairs: set[tuple] = set()

    for a in all_user_ids:
        for b in all_user_ids:
            if a == b:
                continue
            pair = tuple(sorted([a, b]))
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)
            a_net = owes[a].get(b, 0) - owes[b].get(a, 0)
            net[a] -= a_net   # a owes a_net to b → bad for a
            net[b] += a_net   # b receives a_net from a → good for b

    net_balances = [
        {"user_id": uid, "name": user_map.get(uid, "Unknown"), "net": round(net[uid], 2)}
        for uid in all_user_ids
    ]

    # Pairwise: one entry per pair, canonical direction (positive amount only)
    pairwise = []
    seen_pairs2: set[tuple] = set()
    for a in all_user_ids:
        for b in all_user_ids:
            if a == b:
                continue
            pair = tuple(sorted([a, b]))
            if pair in seen_pairs2:
                continue
            seen_pairs2.add(pair)
            x, y = pair
            x_owes_y = owes[x].get(y, 0) - owes[y].get(x, 0)
            if x_owes_y > 0.01:
                pairwise.append({
                    "from_user_id": x, "from_name": user_map.get(x, "Unknown"),
                    "to_user_id": y, "to_name": user_map.get(y, "Unknown"),
                    "amount": round(x_owes_y, 2),
                })
            elif x_owes_y < -0.01:
                pairwise.append({
                    "from_user_id": y, "from_name": user_map.get(y, "Unknown"),
                    "to_user_id": x, "to_name": user_map.get(x, "Unknown"),
                    "amount": round(-x_owes_y, 2),
                })

    return {"net_balances": net_balances, "pairwise": pairwise}
