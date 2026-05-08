"""
Main FastAPI application entry point.
AI Resume Builder & Analyzer - Backend API
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import connect_db, close_db
from config.settings import settings
from utils.password_handler import hash_password

# Import all routers
from routers import auth, resumes, analyzer, ats, job_match, ai_suggestions, interview, chat, export, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    await connect_db()
    await seed_admin()
    print("[OK] AI Resume Builder & Analyzer API started")
    print("[INFO] Docs: http://localhost:8000/docs")
    print("[INFO] Gemini AI:", "Enabled" if settings.gemini_enabled else "Not configured (add GEMINI_API_KEY to .env)")
    yield
    await close_db()
    print("[INFO] Server shutting down")


async def seed_admin():
    """Create the admin user if it doesn't exist."""
    from config.database import get_collection
    from datetime import datetime, timezone
    col = get_collection("users")
    try:
        existing = await col.find_one({"email": settings.ADMIN_EMAIL.lower()})
        if not existing:
            await col.insert_one({
                "name": "Admin",
                "email": settings.ADMIN_EMAIL.lower(),
                "password": hash_password(settings.ADMIN_PASSWORD),
                "role": "admin",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            })
            print("[OK] Admin user seeded:", settings.ADMIN_EMAIL)
    except Exception as e:
        print("[WARN] Could not seed admin:", str(e)[:80])


# Create FastAPI app
app = FastAPI(
    title="AI Resume Builder & Analyzer API",
    description="Complete AI-powered resume building, analysis, and optimization platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(analyzer.router)
app.include_router(ats.router)
app.include_router(job_match.router)
app.include_router(ai_suggestions.router)
app.include_router(interview.router)
app.include_router(chat.router)
app.include_router(export.router)
app.include_router(admin.router)

# Create upload directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "AI Resume Builder & Analyzer API",
        "version": "1.0.0",
        "status": "running",
        "gemini_enabled": settings.gemini_enabled,
        "docs": "/docs",
    }

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": "resume-ai-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
