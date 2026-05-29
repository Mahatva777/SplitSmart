from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, groups, expenses, balances, settlements, activity, ai

app = FastAPI(title="SplitSmart API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        # "https://your-app.vercel.app",
    ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/v1")
app.include_router(groups.router,      prefix="/api/v1")
app.include_router(expenses.router,    prefix="/api/v1")
app.include_router(balances.router,    prefix="/api/v1")
app.include_router(settlements.router, prefix="/api/v1")
app.include_router(activity.router,    prefix="/api/v1")
app.include_router(ai.router,          prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}
