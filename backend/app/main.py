from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import resume, tailor, applications, payments, auth

settings = get_settings()

app = FastAPI(
    title="CareerPilot API",
    description="AI-powered job application suite",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(tailor.router, prefix="/api/tailor", tags=["tailor"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "CareerPilot API"}
