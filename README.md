# SplitSmart

SplitSmart is a simplified Splitwise-inspired shared expense tracking application built for an internship assignment. It focuses on the core workflows of group expense tracking, balance calculation, settlements, and AI-assisted spending insights, while keeping the scope realistic for a short development timeline.

---

## Live Demo

- **Frontend URL:** [https://splitsmart.up.railway.app](https://splitsmart.up.railway.app)
- **Backend URL:** [https://splitsmart-backend.up.railway.app](https://splitsmart-backend.up.railway.app)
- **Swagger Docs:** [https://splitsmart-backend.up.railway.app/docs](https://splitsmart-backend.up.railway.app/docs)

---

## Demo Accounts

For quick evaluation, the deployed application includes a few pre-seeded demo accounts with existing groups, expenses, settlements, and AI insights data.

**Accounts**

| Email                                                   | Password |
| ------------------------------------------------------- | -------- |
| [mahatva@splitsmart.com](mailto:mahatva@splitsmart.com) | 123456   |
| [user2@ss.com](mailto:user2@ss.com)                     | 123456   |
| [user3@ss.com](mailto:user3@ss.com)                     | 123456   |
| [user4@ss.com](mailto:user4@ss.com)                     | 123456   |

### Suggested Demo Flow

1. Login using any of the accounts above.
2. Open an existing group to view:

   * expenses
   * balances
   * settlements
   * activity feed
   * AI insights
3. Try creating a new expense or settlement.
4. Interact with the floating AI assistant.
5. Explore the Shared Asset workflow.

These accounts exist solely for evaluator convenience and contain non-sensitive demonstration data.

---

## Features

Only implemented features are listed below:

- Email/password authentication
- JWT-based protected frontend session
- Landing page, login, signup, dashboard, and profile pages
- Group creation
- Group listing
- Add group members by email
- Equal-split expense tracking
- Shared Asset expense type
- Pairwise and net balance calculation
- Partial settlements
- Group activity feed
- Dashboard activity feed
- Group AI insights endpoint
- Global AI insights endpoint
- Live deployed frontend and backend

---

## Unique Differentiators

### AI Expense Insights Assistant
The application includes an AI-powered insights assistant designed to answer questions only from actual expense, settlement, and balance data. It is intentionally constrained to be concise, structured, and grounded rather than behaving like a generic chatbot.

### Shared Asset Tracking
SplitSmart adds a lightweight Shared Asset feature for purchases such as appliances or furniture. It supports additional metadata like purchase cost, delivery/setup fees, expected resale value, and projected per-person ownership cost.

---

## Screenshots / Demo Flow

This section is intentionally left as a placeholder for evaluator-facing screenshots or a short demo GIF.

Suggested screenshots:
- Landing page
- Signup/Login flow
- Dashboard with groups
- Group creation flow
- Profile page
- Swagger API docs

---

## Tech Stack

### Backend
- Python 3.11
- FastAPI
- SQLAlchemy
- Alembic
- python-jose
- passlib
- psycopg2-binary

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS
- Radix UI dependencies / shadcn-style setup

### Database
- PostgreSQL via Railway

### AI
- Google Gemini (`gemini-2.5-flash` integration target)

---

## Architecture Overview

The project uses a monorepo structure with a FastAPI backend and a React + Vite frontend.

- The backend exposes REST endpoints for authentication, groups, expenses, balances, settlements, activity, and AI insights.
- The frontend is a single-page application with protected routes and an auth context.
- Balance calculations are derived from expenses and settlements rather than stored directly.
- Shared Asset data is stored as additional metadata on top of standard expense records.

---

## Local Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload
```

Backend runs by default at:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs by default at:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend
Create `backend/.env` with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/splitsmart
SECRET_KEY=change-this-to-a-long-random-string-minimum-32-chars
GEMINI_API_KEY=your-gemini-api-key-here
```

### Frontend
Create `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Deployment

### Railway Deployment Process

The final deployed project uses Railway for the complete stack.

#### Backend
1. Create a Railway service for the backend.
2. Provision Railway Postgres.
3. Set backend environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `GEMINI_API_KEY`
4. Deploy using the backend Dockerfile.
5. Verify the app via `/docs` and `/health`.

#### Frontend
1. Create a Railway service for the frontend.
2. Set `VITE_API_BASE_URL` to the deployed backend API base.
3. Build the Vite app in production.
4. Verify that auth and API requests work against the live backend.

### Deployment Notes
- The backend currently uses Alembic migrations on startup.
- The backend Dockerfile startup command should be updated to use Railway's `PORT` variable safely.
- The backend CORS configuration is currently permissive and should be tightened for a more production-hardened setup.

---

## API Overview

Major endpoint groups:

### Auth
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Groups
- `GET /api/v1/groups`
- `POST /api/v1/groups`
- `GET /api/v1/groups/{id}`
- `POST /api/v1/groups/{id}/members`

### Expenses
- `GET /api/v1/groups/{group_id}/expenses`
- `POST /api/v1/groups/{group_id}/expenses`
- `PUT /api/v1/groups/{group_id}/expenses/{expense_id}`
- `DELETE /api/v1/groups/{group_id}/expenses/{expense_id}`

### Balances
- `GET /api/v1/groups/{group_id}/balances`

### Settlements
- `GET /api/v1/groups/{group_id}/settlements`
- `POST /api/v1/groups/{group_id}/settlements`

### Activity
- `GET /api/v1/groups/{group_id}/activity`
- `GET /api/v1/dashboard/activity`

### AI
- `POST /api/v1/groups/{group_id}/ai/chat`
- `POST /api/v1/ai/chat`

---

## AI Usage

### Claude Usage
Claude was used as the primary collaborator during product discovery and initial scoping. It conducted the structured interview required by the assignment and produced the initial planning documents.

### Perplexity Usage
Perplexity was used for implementation review, deployment diagnostics, frontend refinement support, and the final documentation pass to align the documents with the actual built app.

### AI Collaboration Workflow
1. Start with assignment-required discovery prompt.
2. Use Claude to clarify product requirements and generate early planning docs.
3. Build the application against the agreed scope.
4. Use Perplexity to review deployment readiness, refine implementation decisions, and finalize documentation.

### AI_CONTEXT.md Maintenance
`AI_CONTEXT.md` was intended to be maintained continuously as a living source of truth. In practice, it was strongest during planning and then updated comprehensively again at the end so that it accurately reflects the shipped system.

---

## Project Structure

```text
splitsmart/
├── backend/
│   ├── app/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routers/
│   │   └── services/
│   ├── alembic/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── AI_CONTEXT.md
├── BUILD_PLAN.md
└── README.md
```

---

## Testing

Actual testing performed:

- authentication flow testing
- group creation testing
- add members flow testing
- expense creation and retrieval testing
- shared asset data flow testing
- balance calculation testing
- settlement testing
- activity feed testing
- AI endpoint testing
- live deployment verification through frontend and Swagger docs

Testing was primarily manual rather than automated.

---

## Known Limitations

- Equal split only
- No debt simplification
- No OAuth
- No email verification
- No invite system for non-registered users
- No automated tests
- Shared Asset is projection-only
- Current backend CORS is permissive
- Docker startup command needs safer Railway port binding
- Frontend route coverage is narrower than the earliest plan

---

## Future Improvements

If more time were available, the next improvements would be:

- expand frontend coverage for all backend workflows
- add automated tests for balance calculations and settlements
- tighten production CORS
- improve Railway startup command for dynamic port binding
- deepen AI UI integration
- extend Shared Asset lifecycle support

---

## Assignment Deliverables

- Public deployed app: complete
- Repository: complete
- README: complete
- BUILD_PLAN: complete
- AI_CONTEXT: complete
- AI collaboration history: documented in `AI_CONTEXT.md`

