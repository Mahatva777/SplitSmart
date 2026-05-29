# AI_CONTEXT.md

> This document is the living source of truth for the implemented SplitSmart application.
> It reflects the actual built system, actual deployment, actual tradeoffs, and the AI-assisted development process used to complete the assignment.
> It is written so another evaluator, developer, or AI agent can understand how the application was scoped, implemented, and deployed.

---

## 1. Product Understanding

### Product Summary
SplitSmart is a simplified Splitwise-inspired shared expense tracking application built for a 3-day internship assessment. The goal was not to reproduce Splitwise pixel-for-pixel, but to reverse engineer its core behavior, scope an achievable MVP, and ship a working deployed product with one meaningful differentiator.

### Core Problem Solved
The product solves the coordination problem around shared spending between small groups. When multiple people pay for meals, utilities, rent, travel costs, or shared purchases, it becomes difficult to remember who paid, who owes whom, and how much remains unsettled. SplitSmart maintains a transparent shared ledger, computes balances automatically, and records settlements clearly.

### Differentiators Chosen
Two differentiators were selected intentionally during product scoping:

1. **AI Expense Insights Assistant**
   - A concise assistant that answers questions only from actual expense and balance data.
   - It is not a general chatbot and does not provide broad financial advice.

2. **Shared Asset Tracking**
   - A lightweight special expense type for long-term shared purchases such as appliances or furniture.
   - It supports purchase cost, delivery/setup fees, expected resale value, and a projected ownership share.
   - It remains metadata plus ownership projection only, not inventory management.

---

## 2. Product Scope

### In Scope
The actual implemented application includes:

- Email/password authentication
- Immediate access after signup
- User dashboard
- Group creation and listing
- Add members to a group by email
- Equal-split expenses only
- Expense categories
- Shared Asset expense type
- Group balances and pairwise debt breakdown
- Partial settlements
- Group activity feed
- Dashboard recent activity
- AI assistant endpoints for group and global insights
- Profile page with authenticated user info
- Live deployed frontend and backend

### Out of Scope
The following were intentionally excluded from implementation:

- OAuth login
- Email verification
- Unequal / percentage splits
- Debt simplification
- Receipt uploads
- Notifications
- Pending invites for non-registered users
- Expense attachments
- Shared Asset resale workflow
- Ownership transfer workflow
- Depreciation timeline logic
- Advanced analytics dashboards
- Automated test suite
- Natural language expense creation
- Full Splitwise-grade group lifecycle complexity

### Scope Discipline
The scope was kept intentionally tight to protect correctness of balances, keep the UI polished enough for evaluation, and ensure deployability within the assignment timeline.

---

## 3. User Personas

### Primary Persona: Shared Expense Group Member
- A roommate, friend, or trip participant who wants a clear ledger of shared expenses.
- Cares about adding expenses quickly and understanding balances without spreadsheets.

### Secondary Persona: Group Organizer
- The person who creates the group and pays for more expenses than others.
- Needs visibility into who owes whom and an auditable settlement history.

### Evaluator Persona
- The internship evaluator reviewing product thinking, implementation choices, AI collaboration process, and documentation quality.
- Needs clarity, reproducibility, and evidence that the built app matches the described system.

---

## 4. User Stories

### Authentication
- As a new user, I can sign up with name, email, and password.
- As a returning user, I can log in with email and password.
- As an authenticated user, I can remain logged in using a JWT stored on the frontend.
- As a logged-in user, I can access my dashboard and profile.

### Groups
- As a user, I can create a new group.
- As a user, I can belong to multiple groups.
- As a group member, I can see a list of my groups on the dashboard.
- As a group member, I can add another registered user to a group by email.

### Expenses
- As a group member, I can add an expense to a group.
- As a group member, I can choose a category for the expense.
- As a group member, I can split an expense equally.
- As a group member, I can mark an expense as a Shared Asset and include asset-specific fields.
- As the creator of an expense, I can edit or delete it through the backend API.

### Balances and Settlements
- As a group member, I can view current balances in a group.
- As a group member, I can view raw pairwise "who owes whom" balances.
- As a group member, I can record a partial settlement.
- As a group member, I can see settlements reflected in activity and balance calculations.

### AI Assistant
- As a user, I can ask for group-level spending insights.
- As a user, I can ask for global spending insights across my groups.
- As a user, I receive concise responses grounded only in actual app data.

---

## 5. Implementation Decisions

### Product Decisions
- Clone core Splitwise workflows rather than the full product.
- Prioritize correctness of balances over advanced feature depth.
- Use Shared Asset as a lightweight differentiator rather than a second product system.
- Keep AI output concise and structured.

### Engineering Decisions
- Use FastAPI for rapid backend iteration and built-in Swagger docs.
- Use SQLAlchemy ORM with Alembic for schema management.
- Use PostgreSQL-oriented schema and Railway deployment.
- Use React + Vite for a fast SPA frontend.
- Use React Context instead of Redux.
- Use equal split only to keep calculation logic simple and auditable.
- Compute balances from source records instead of storing derived balances.

### UX Decisions
- Keep authentication simple.
- Keep the UI focused on dashboard, group workflows, and profile.
- Prefer a lightweight product feel over a feature-dense experience.
- Use a clean visual style later refined toward a Spreetail-inspired look.

---

## 6. Engineering Requirements

The implemented system was required to satisfy the following engineering constraints:

- Separate frontend and backend within one repo
- FastAPI backend
- SQLAlchemy ORM
- PostgreSQL-compatible database config
- Alembic migrations
- JWT authentication
- React + Vite frontend
- Tailwind CSS and shadcn/ui style primitives
- React Context for auth state
- Deployable backend
- Deployable frontend
- Environment-variable based configuration
- AI responses grounded in app data only
- No debt simplification
- Equal split only

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| Database Driver | psycopg2-binary |
| Auth | python-jose, passlib bcrypt |
| Config | pydantic-settings |
| AI | Google Gemini API (`gemini-2.5-flash` intended integration target) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Styling | Tailwind CSS |
| UI Primitives | shadcn/ui-style component setup + Radix UI deps |
| Deployment | Railway |

### AI Tools Used During Development
- Claude: used heavily during product discovery, scoping, and early planning
- Perplexity: used for review, implementation support, deployment checks, UI refinement guidance, and documentation consolidation

---

## 8. Database Schema

The actual backend uses a single `models.py` file with SQLAlchemy models.

### `users`
- `id` (string UUID)
- `name`
- `email` (unique)
- `password_hash`
- `created_at`

### `groups`
- `id`
- `name`
- `description`
- `created_by`
- `created_at`

### `group_members`
- `id`
- `group_id`
- `user_id`
- `joined_at`
- `is_active`
- unique constraint on `(group_id, user_id)`

### `expenses`
- `id`
- `group_id`
- `created_by`
- `title`
- `amount`
- `category`
- `notes`
- `is_shared_asset`
- `created_at`
- `updated_at`

### `expense_splits`
- `id`
- `expense_id`
- `user_id`
- `amount_owed`
- `created_at`

### `shared_asset_details`
- `id`
- `expense_id` (unique)
- `asset_name`
- `purchase_cost`
- `delivery_fee`
- `setup_fee`
- `expected_resale_value`
- `total_cost`
- `net_ownership_cost`
- `per_person_estimate`

### `settlements`
- `id`
- `group_id`
- `payer_id`
- `payee_id`
- `amount`
- `note`
- `created_at`

### Data Modeling Notes
- UUIDs are stored as strings for portability.
- Derived balances are not stored in the database.
- Shared Asset data is stored only when `is_shared_asset = true`.
- Expense splits represent who owes the payer.

---

## 9. API Design

### Base Path
`/api/v1`

### Public Endpoints
- `POST /auth/signup`
- `POST /auth/login`
- `GET /health`

### Authenticated Endpoints

#### Auth
- `GET /auth/me`

#### Groups
- `GET /groups`
- `POST /groups`
- `GET /groups/{id}`
- `PUT /groups/{id}`
- `DELETE /groups/{id}`
- `POST /groups/{id}/members`
- `DELETE /groups/{id}/members/{user_id}`

#### Expenses
- `GET /groups/{group_id}/expenses`
- `POST /groups/{group_id}/expenses`
- `GET /groups/{group_id}/expenses/{expense_id}`
- `PUT /groups/{group_id}/expenses/{expense_id}`
- `DELETE /groups/{group_id}/expenses/{expense_id}`

#### Balances
- `GET /groups/{group_id}/balances`

#### Settlements
- `GET /groups/{group_id}/settlements`
- `POST /groups/{group_id}/settlements`

#### Activity
- `GET /groups/{group_id}/activity`
- `GET /dashboard/activity`

#### AI
- `POST /groups/{group_id}/ai/chat`
- `POST /ai/chat`

### API Behavior Notes
- JWT bearer auth is required for protected routes.
- Swagger docs are available from the deployed backend.
- Group and expense workflows are primarily API-driven even if some frontend pages are minimal.

---

## 10. Frontend Structure

### Actual Implemented Routes
The actual frontend currently implements these routes:

- `/` → Landing page
- `/login` → Login page
- `/signup` → Signup page
- `/dashboard` → Protected dashboard
- `/profile` → Protected profile page

### Actual Implemented Frontend Files

#### Pages
- `Landing.jsx`
- `Login.jsx`
- `Signup.jsx`
- `Dashboard.jsx`
- `Profile.jsx`

#### Core Components
- `Layout.jsx`
- `CreateGroupModal.jsx`
- UI primitives under `components/ui/`

#### Context
- `AuthContext.jsx`

#### API Layer
- `src/api/client.js`

#### Utilities
- `src/lib/utils.js`

### Frontend Notes
- The frontend is a Vite SPA.
- Auth state is handled through `AuthContext`.
- API requests use Axios with JWT injection from `localStorage`.
- Protected routes redirect unauthenticated users to `/login`.

### Important Accuracy Note
The earlier planning documents referenced more pages such as Group Detail, Settle Up, and Add Expense pages as dedicated routes. The actual frontend repository snapshot currently includes the implemented routes listed above, and documentation should reflect that reality.

---

## 11. Backend Structure

### Actual Implemented Backend Files

- `main.py`
- `app/config.py`
- `app/database.py`
- `app/auth.py`
- `app/models.py`
- `app/services/balance_service.py`
- `app/services/ai_service.py`
- `app/routers/auth.py`
- `app/routers/groups.py`
- `app/routers/expenses.py`
- `app/routers/balances.py`
- `app/routers/settlements.py`
- `app/routers/activity.py`
- `app/routers/ai.py`

### Backend Organization Notes
- `main.py` creates the FastAPI app and includes all routers.
- `database.py` sets up the SQLAlchemy engine/session.
- `models.py` contains all ORM models in one file.
- `balance_service.py` computes net and pairwise balances.
- `ai_service.py` builds the AI prompt from live app data.

---

## 12. Deployment Plan

### Planned Deployment Approach
The intended plan evolved into a single-platform deployment strategy on Railway:

- Backend deployed on Railway
- Frontend deployed on Railway
- PostgreSQL hosted via Railway-managed Postgres
- Environment variables managed in Railway service settings
- Backend started using Docker
- Frontend built as a Vite production build and served as deployed app

### Why Railway Only
Although earlier planning mentioned Vercel for the frontend, the actual deployment path used Railway for the complete application because it simplified deployment management and kept backend, frontend, and database in one operational platform.

---

## 13. Actual Deployment Configuration

### Live URLs
- **Frontend URL:** `https://splitsmart.up.railway.app`
- **Backend URL:** `https://splitsmart-backend.up.railway.app`
- **Swagger Docs:** `https://splitsmart-backend.up.railway.app/docs`

### Backend Environment Variables Used
- `DATABASE_URL`
- `SECRET_KEY`
- `GEMINI_API_KEY`
- `JWT_ALGORITHM` (optional override not required in code because default exists)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (optional override not required in code because default exists)

### Frontend Environment Variables Used
- `VITE_API_BASE_URL`

### Railway Deployment Details
#### Backend Service
- Python 3.11-based Docker deployment
- Uses `backend/Dockerfile`
- Runs Alembic migrations on startup
- Starts Uvicorn server
- Connects to Railway PostgreSQL via `DATABASE_URL`

#### Database Service
- Railway Postgres
- Application uses SQLAlchemy + psycopg2
- Alembic configured to read `DATABASE_URL`

#### Frontend Service
- Vite production build deployed to Railway
- Frontend reads `VITE_API_BASE_URL` for backend communication

### Production Notes
- Backend exposes `/health` for a basic health check.
- Swagger docs were used for manual verification of backend endpoints.
- Production auth uses JWT bearer tokens.
- Current backend CORS middleware is permissive and should be documented as an implementation tradeoff, not an ideal final production posture.
- The Dockerfile currently hardcodes port `8000`; this was later identified during deployment review as a deployment risk and a fix was proposed.

---

## 14. Testing Plan

### Testing Strategy Chosen
Manual end-to-end testing was chosen instead of a full automated test suite due to the timeboxed nature of the assignment.

### Actual Testing Performed

#### Authentication
- Signup flow tested
- Login flow tested
- `/auth/me` tested through authenticated frontend session and backend API
- Unauthorized redirect behavior verified in frontend

#### Groups
- Group creation tested
- Group listing tested on dashboard
- Group retrieval tested through API

#### Add Members
- Member add-by-email flow tested
- Existing-account constraint validated through API behavior

#### Expenses
- Expense creation tested
- Expense listing tested
- Expense retrieval tested
- Expense update/delete behavior tested through backend routes

#### Shared Assets
- Shared Asset expense creation tested
- Metadata fields tested
- Ownership projection fields validated through backend data flow

#### Balances
- Group balance calculations tested after expenses
- Pairwise balances tested
- Net balances tested
- Recalculation behavior validated after settlements

#### Settlements
- Partial settlement creation tested
- Settlement list tested
- Balance impact after settlement tested

#### Activity Feed
- Group activity endpoint tested
- Dashboard activity endpoint tested
- Expense and settlement merge ordering checked

#### AI Assistant
- Group AI endpoint tested
- Global AI endpoint tested
- Response grounding reviewed against actual app data
- Failure fallback behavior observed in service layer if AI provider is unavailable

### Testing Limitations
- No formal automated backend tests were added.
- No Playwright/Cypress or browser automation was added.
- Testing was primarily manual through the live app, local frontend behavior, and Swagger docs.

---

## 15. Tradeoffs

| Decision | Chosen Approach | Reason |
|---|---|---|
| Split types | Equal only | Keeps logic reliable and easy to audit |
| Balance algorithm | Raw pairwise balances | Easier to explain, implement, and debug |
| AI assistant | Data-grounded concise assistant | Keeps outputs relevant and safe |
| Shared Asset | Metadata + projection only | Adds differentiation without a second product system |
| Testing | Manual end-to-end | Fit the 3-day scope |
| Frontend state | React Context | Lower complexity than Redux |
| Deployment | Railway only | Simpler operational setup |
| Model structure | Single `models.py` | Faster implementation for MVP |

---

## 16. Known Limitations

- No OAuth login
- No email verification
- No invite flow for users without accounts
- Equal split only
- No debt simplification
- No receipt upload support
- No automated tests
- Shared Asset does not support resale completion flow
- Shared Asset does not support depreciation over time
- Frontend route coverage is narrower than the originally envisioned full product surface
- Current CORS setup is permissive
- Dockerfile startup command originally hardcoded the port

---

## 17. Changes Made During Implementation

This section captures the difference between the original plan and what was actually built.

### Original Plan
The original plan envisioned:
- Railway backend + Vercel frontend
- A larger set of frontend routes including dedicated group detail and expense flows
- A more explicit living-update process inside `AI_CONTEXT.md` throughout implementation
- A more extensive frontend experience around groups, balances, settlements, and AI interactions

### Actual Changes Made
1. **Deployment changed to Railway-only**
   - Frontend and backend were both deployed on Railway.
   - This reduced platform switching and simplified management.

2. **Frontend scope was narrower than the original route map**
   - Actual implemented frontend pages are Landing, Login, Signup, Dashboard, and Profile.
   - Some originally planned routes remain represented in the backend API rather than as documented frontend pages in the current code snapshot.

3. **Backend structure simplified into a single model module**
   - Instead of multiple model files, the actual backend uses one `models.py`.
   - This improved speed and maintainability within the assignment timeline.

4. **AI documentation lagged behind implementation**
   - The early `AI_CONTEXT.md` and `BUILD_PLAN.md` were strong planning docs but were not continuously updated during implementation as thoroughly as the assignment ideally requested.
   - This final documentation pass corrects that gap.

5. **Production deployment review surfaced deployment risks**
   - CORS remained permissive.
   - Railway port binding needed a safer startup command.
   - These are recorded as implementation realities and deployment lessons.

### Why These Changes Were Made
- Timeboxing favored working deployment and backend correctness over perfect parity with the original route map.
- Railway-only deployment reduced friction.
- Simpler file organization accelerated delivery.
- Focus remained on shipping a working app instead of overengineering.

---

## 18. AI Collaboration & Prompt History

This section documents summary of how AI was used throughout the assignment and how the project direction evolved.
The Exact prompts and responses are included in `All_Prompts.md` file.

### Initial Assignment Prompt
The project began by pasting the assignment-required prompt into Claude. The prompt instructed the AI to:
- behave like a junior engineer,
- not assume requirements,
- ask detailed product and engineering questions first,
- maintain `AI_CONTEXT.md` as a source of truth,
- produce a plan only after enough questioning.

### Product Discovery Phase
Claude conducted a structured interview before implementation.

#### Major question areas asked
- product goals
- what Splitwise behavior matters most
- user personas
- MVP scope
- out-of-scope features
- data model details
- auth decisions
- group membership behavior
- expense editing/deletion rules
- shared asset behavior
- settlement rules
- balance calculation model
- UI screens
- deployment preferences
- testing approach
- known risks
- tradeoffs

#### Major answers and decisions provided by the user
- The user had personally used Splitwise and studied its workflows.
- The core problem was framed as reducing friction around shared expenses.
- The target users were small groups such as roommates, friends, trip groups, and households.
- Success meant reproducing core workflows with reliable balances and one differentiating feature.
- The product should feel like a real deployable product, not a rough prototype.
- The differentiators selected were AI insights and Shared Asset tracking.
- Email/password auth was preferred.
- Immediate access after signup was acceptable.
- Group members must already have accounts.
- Multiple groups were required.
- Any member could add members.
- Groups were plain groups with name/description, not typed groups.
- Equal split only was selected.
- Only the expense creator should edit/delete expenses.
- Expense edits should trigger recalculation.
- Partial settlements were required.
- No debt simplification.
- Group activity should remain visible and auditable.
- FastAPI, PostgreSQL, React, Tailwind, shadcn/ui, React Context, and monorepo structure were chosen.
- Deployment preference was Railway, and earlier at planning time Vercel was considered for frontend before the final Railway-only execution.
- Manual testing was considered sufficient.

### Architecture Phase
Representative prompts and decisions during architecture included:

#### FastAPI choice
Prompt direction focused on selecting a backend that was fast to scaffold, aligned with existing comfort, and provided automatic API docs. FastAPI was chosen over Django REST Framework for development speed and Swagger support.

#### React + Vite choice
Prompt direction emphasized fast frontend iteration, modern DX, and easy deployment. React + Vite was chosen for speed and familiarity.

#### PostgreSQL choice
Prompt direction compared SQLite convenience vs PostgreSQL realism. The final decision was PostgreSQL-oriented implementation with Railway DB support.

#### Railway deployment choice
Prompt direction initially split frontend/backend across services, but the actual deployment converged on Railway-only for operational simplicity.

#### Gemini choice
Prompt direction focused on grounded AI insights rather than agentic behavior. Gemini was selected because it was sufficient for concise data-grounded answers and easy to integrate.

### Backend Implementation Phase
Representative prompt themes used during backend implementation:

#### Authentication
- build signup/login/me routes using JWT bearer auth
- hash passwords with bcrypt
- return minimal auth payloads and current user data

#### Groups
- create group CRUD endpoints
- add member by email
- keep group logic simple and membership-based

#### Expenses
- create expenses with equal splits only
- generate split rows automatically
- support shared asset metadata
- allow edit/delete for creator only

#### Balances
- compute balances from source records instead of storing them
- expose both net balances and pairwise debts
- keep logic transparent rather than simplified

#### Settlements
- store partial settlements as records
- subtract settlements from pairwise debts
- keep settlements visible in activity

#### Activity Feed
- merge expenses and settlements into one time-sorted feed
- provide both group and dashboard-level activity endpoints

### Frontend Implementation Phase
Representative prompt themes used during frontend implementation:

- create a Vite React app with Tailwind setup
- implement auth flow and protected routes
- build landing page, login, signup, dashboard, and profile pages
- create a group creation modal
- wire Axios with JWT token injection
- format currency and dates cleanly
- keep UI modern and evaluator-friendly

Specific frontend-focused prompt areas included:
- dashboard layout and data display
- group list rendering
- recent activity display
- auth context design
- profile summary view
- styling refinement

### AI Assistant Phase
Representative prompt themes used for the assistant:

- keep the assistant grounded only in live app data
- inject group expense, settlement, and balance data into the prompt
- keep responses concise and structured
- do not provide generic financial advice
- support both group and global insight modes

### UI/UX Refinement Phase
Representative prompt themes included:

- improve the visual polish without redesigning architecture
- make dashboard and group-related views cleaner and more professional
- apply a Spreetail-inspired visual system
- keep the interface modern, minimal, and readable

The intended refinement themes included floating/draggable AI assistant behavior and minimize/maximize interaction ideas during design discussion, but the final documentation should only treat them as refinement direction unless clearly present in the shipped code.

### Debugging & Stabilization Phase
Representative prompt themes included:

- fix deployment readiness issues
- review Railway startup behavior
- inspect CORS configuration
- validate environment variables
- confirm API base URL handling in Vite
- review production build assumptions

Specific stabilization topics documented during the project included:
- routing coverage and route protection behavior
- deployment review for Railway
- CORS permissiveness
- Railway port-binding fix recommendation
- migration startup expectations

### AI Collaboration Summary
The AI collaboration process followed this pattern:
1. Claude handled structured product discovery and initial scoping.
2. AI-generated planning artifacts (`AI_CONTEXT.md`, `BUILD_PLAN.md`) established the first source of truth.
3. Implementation work proceeded against those decisions.
4. Perplexity was used later for implementation help, review, deployment diagnostics, UI refinement support, and final documentation consolidation.
5. This final pass updates the documentation so it matches the actual built app rather than only the original plan.

---

## 19. Production Notes for Reproduction

To reproduce a similar build:

1. Create a monorepo with `backend/` and `frontend/`.
2. Build FastAPI auth, groups, expenses, balances, settlements, activity, and AI routes.
3. Use SQLAlchemy with a PostgreSQL-compatible schema and Alembic.
4. Keep balance logic computed from expenses plus settlements.
5. Build a React + Vite frontend with auth context and a dashboard-first workflow.
6. Use Railway for backend, frontend, and PostgreSQL deployment.
7. Configure `DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`, and `VITE_API_BASE_URL`.
8. Keep AI assistant outputs tightly grounded to the injected data.

---

## 20. Final Accuracy Notes

This final version of `AI_CONTEXT.md` is intended to correct the earlier planning-only state of the document and align it with:
- the assignment brief,
- the original discovery conversation,
- the actual repository structure,
- and the live deployed application.

