# BUILD_PLAN.md

> This document reflects the actual build process for SplitSmart after implementation, not just the initial intended plan.
> It is written to show product thinking, scope control, AI collaboration, implementation order, tradeoffs, and what changed during development.

---

## 1. Product Research

### How Splitwise Was Studied
The product research phase relied on a mix of direct usage experience and intentional reverse engineering. The user had already used Splitwise in real life and was familiar with the core workflows around groups, expenses, balances, and settlements. That familiarity was then converted into explicit product decisions through an AI-led interview process.

### What Was Learned
The most important product insight was that Splitwise's core value is not the UI itself, but the ledger logic:
- people create groups,
- add expenses,
- see who owes whom,
- and settle over time.

This made it clear that correctness of balances mattered more than feature breadth.

### Core Workflows Identified
The research and scoping phase identified the following workflows as the true MVP:
1. User signs up or logs in.
2. User creates a group.
3. User adds members by email.
4. User adds an expense.
5. Expense is split equally among selected members.
6. Group balances update automatically.
7. A member records a partial or full settlement.
8. Activity history remains visible.
9. User can ask the AI assistant for spending insights.

### Product Assumptions Made
- Users already know one another.
- Users are comfortable with shared ledgers.
- Members added to groups already have accounts.
- Transparency is more important than aggressive optimization.
- A polished, smaller product is stronger than an oversized incomplete one.

---

## 2. Final Scope

### What Was Chosen
The final implementation focused on the following shipped capabilities:

| Feature | Built |
|---|---|
| Email/password authentication | Yes |
| JWT auth | Yes |
| Dashboard | Yes |
| Profile page | Yes |
| Group creation | Yes |
| Group listing | Yes |
| Add members by email | Yes |
| Equal split expenses | Yes |
| Shared Asset expense type | Yes |
| Pairwise balances | Yes |
| Net balances | Yes |
| Partial settlements | Yes |
| Group activity feed | Yes |
| Dashboard activity feed | Yes |
| Group AI assistant endpoint | Yes |
| Global AI assistant endpoint | Yes |
| Railway deployment | Yes |

### What Was Not Built

| Feature | Reason |
|---|---|
| OAuth | Out of scope for 3-day build |
| Email verification | Out of scope |
| Unequal/percentage splits | Would complicate calculation logic |
| Debt simplification | Not necessary for MVP; harder to debug |
| Receipt uploads | Non-core |
| Invite flow for non-users | More lifecycle complexity |
| Full analytics dashboard | Nice-to-have, not core |
| Automated test suite | Timeboxed out |
| Full shared asset resale lifecycle | Would over-expand scope |
| Natural language expense creation | Stretch only, not implemented |

### Why This Scope Was Achievable
- The backend remained focused on ledger logic.
- The frontend stayed relatively lean.
- The AI assistant was kept non-agentic and prompt-grounded.
- Shared Asset stayed lightweight instead of becoming a separate module.
- Deployment was simplified onto Railway.

---

## 3. Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| DB | PostgreSQL-compatible configuration |
| Auth | JWT |
| AI | Gemini |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| State | React Context |
| Deployment | Railway |

### Backend Structure
Actual backend structure:

```text
backend/
├── app/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── routers/
│   │   ├── activity.py
│   │   ├── ai.py
│   │   ├── auth.py
│   │   ├── balances.py
│   │   ├── expenses.py
│   │   ├── groups.py
│   │   └── settlements.py
│   └── services/
│       ├── ai_service.py
│       └── balance_service.py
├── alembic/
├── Dockerfile
├── main.py
└── requirements.txt
```

### Frontend Structure
Actual frontend structure:

```text
frontend/
├── src/
│   ├── api/client.js
│   ├── components/
│   │   ├── CreateGroupModal.jsx
│   │   ├── Layout.jsx
│   │   └── ui/
│   ├── context/AuthContext.jsx
│   ├── lib/utils.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   └── Signup.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### Database Schema Summary
Core tables:
- users
- groups
- group_members
- expenses
- expense_splits
- shared_asset_details
- settlements

Balances are computed dynamically instead of being stored.

### API Design Summary
Core route groups:
- `/auth`
- `/groups`
- `/groups/{id}/expenses`
- `/groups/{id}/balances`
- `/groups/{id}/settlements`
- `/groups/{id}/activity`
- `/groups/{id}/ai/chat`
- `/ai/chat`
- `/dashboard/activity`

### Deployment Approach
Final deployment used Railway for the full stack:
- frontend on Railway
- backend on Railway
- PostgreSQL on Railway

---

## 4. AI Collaboration Process

### Initial AI Instruction Style
The project started with the assignment-required prompt. Perplexity was instructed to act like a junior engineer, not assume requirements, ask detailed product and engineering questions first, and keep `AI_CONTEXT.md` as the living source of truth.

### Discovery Interview Process
Perplexity first ran a structured interview instead of jumping into code. This was important because the assignment explicitly tested product reasoning, scoping ability, and context preservation.

The interview covered:
- product goals
- Splitwise research
- core workflows
- users and personas
- scope decisions
- out-of-scope choices
- database model
- auth
- groups
- expenses
- settlements
- balance logic
- AI assistant behavior
- UI expectations
- deployment choices
- testing choices
- risks and tradeoffs

### How the Plan Evolved
Major decisions made during the AI interview:
- use FastAPI over Django REST Framework
- use React + Vite for frontend
- use PostgreSQL-oriented backend
- use Railway deployment
- support only equal splits
- do not implement debt simplification
- support partial settlements
- keep Shared Asset lightweight
- keep AI concise and grounded

### AI_CONTEXT Maintenance Reality
AI_CONTEXT.md` was continuously updated throughout implementation. In practice, the strongest updates happened during planning, while implementation moved faster than documentation. This final documentation pass closes that gap by aligning the documents with the actual shipped system.

### Multi-AI Workflow
- Claude & GPT: primary collaborator during product discovery and early planning
- Perplexity: implementation review, deployment review, UI refinement assistance, and final documentation update

---

## 5. Actual Development Timeline

The original plan was expressed as a day-by-day sprint. The real implementation happened as a milestone-driven flow.

### Milestone 1 — Product Discovery and Scope Lock
Completed tasks:
- assignment review
- structured AI interview
- product scope definition
- tech stack selection
- data model decisions
- initial `AI_CONTEXT.md` generation
- initial `BUILD_PLAN.md` generation

### Milestone 2 — Backend Foundation
Completed tasks:
- FastAPI project setup
- SQLAlchemy database setup
- config and auth helpers
- core models implemented in `models.py`
- Alembic setup
- router structure created

### Milestone 3 — Core Ledger Logic
Completed tasks:
- group endpoints
- expense endpoints
- split generation logic
- shared asset support
- balance computation service
- settlement endpoints
- activity feed endpoints

### Milestone 4 — AI Integration
Completed tasks:
- AI service implementation
- prompt grounding design
- group data injection
- global data injection
- group AI endpoint
- global AI endpoint

### Milestone 5 — Frontend Foundation
Completed tasks:
- Vite React app setup
- Tailwind setup
- Auth context
- API client with JWT handling
- protected route flow
- landing page
- login page
- signup page
- dashboard page
- profile page
- reusable layout and modal components

### Milestone 6 — Deployment
Completed tasks:
- Railway backend deployment
- Railway frontend deployment
- Railway Postgres connection
- environment variable setup
- backend docs verification
- live app verification

### Milestone 7 — Review and Stabilization
Completed tasks:
- deployment readiness review
- CORS review
- Railway startup review
- Vite environment variable review
- documentation gap analysis
- final documentation update

---

## 6. Milestones Reached

| Milestone | Status |
|---|---|
| Product scope defined | Completed |
| AI_CONTEXT created | Completed |
| BUILD_PLAN created | Completed |
| Backend API implemented | Completed |
| Balance logic implemented | Completed |
| Shared Asset implemented | Completed |
| AI assistant endpoints implemented | Completed |
| Frontend app implemented | Completed |
| Railway backend deployed | Completed |
| Railway frontend deployed | Completed |
| Final documentation update | Completed |

---

## 7. Tradeoffs

| Area | Tradeoff |
|---|---|
| Splits | Equal only instead of flexible split methods |
| Balance logic | Raw pairwise instead of simplification |
| Frontend breadth | Smaller route surface than full original vision |
| Testing | Manual testing instead of full automation |
| Shared Asset | Projection-only instead of full lifecycle |
| AI | Insight assistant instead of action-taking agent |
| Model organization | Single-file model definitions for speed |
| Deployment | Railway-only for simplicity |

---

## 8. What Changed During Development

### Planned vs Actual Changes

#### Deployment
- **Planned:** Railway backend + Vercel frontend
- **Actual:** Railway used for complete deployment
- **Why:** simpler environment management and faster deployment iteration

#### Frontend Surface Area
- **Planned:** More pages including detailed group-specific route flow
- **Actual:** The committed frontend snapshot centers on landing, auth, dashboard, and profile
- **Why:** prioritize a working deployed path and core flows over route breadth

#### Model File Structure
- **Planned:** Separate model files
- **Actual:** Unified `models.py`
- **Why:** faster delivery and easier coordination within time constraints

#### Documentation Process
- **Planned:** Continuous in-line updates to `AI_CONTEXT.md`
- **Actual:** stronger upfront planning docs, then a corrective final documentation pass
- **Why:** implementation moved faster than documentation updates during the build phase

### Features Planned But Not Fully Realized in Frontend Scope
- full route-by-route UI surface originally imagined in early planning
- richer dedicated views around group subflows
- broader profile analytics surface

### Implemented But Initially Under-Documented
- actual Railway-only deployment path
- actual single-file model structure
- actual frontend route surface
- deployment readiness constraints discovered during review

---

## 9. What Would Be Improved With More Time

If more time were available, the next improvements would be:

1. Build out full frontend coverage for all backend group and expense flows.
2. Add automated backend tests for balance calculations and settlements.
3. Tighten CORS for exact production origins.
4. Update Docker startup to bind safely to Railway's injected port.
5. Expand Shared Asset into a richer lifecycle if product scope allowed.
6. Improve AI UI presentation and deeper frontend integration.
7. Strengthen documentation maintenance during implementation instead of after.

---

## 10. Final Build Summary

SplitSmart was successfully scoped as a realistic 3-day Splitwise-inspired product. The implementation prioritized ledger correctness, deployability, and clear engineering decisions over feature sprawl. The final result is a live deployed application with documented AI collaboration, a grounded AI expense assistant, and a lightweight Shared Asset differentiator.

