from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import resume, tailor, applications, payments, auth

settings = get_settings()

app = FastAPI(
    title="CareerPilot API",
    description="AI-powered job application suite",
    version="1.0.0",
)

ALLOWED_ORIGINS = {
    settings.frontend_url,
    "http://localhost:5173",
    "https://jobhunt-39d54.web.app",
    "https://jobhunt-39d54.firebaseapp.com",
}
if settings.allowed_origins:
    ALLOWED_ORIGINS.update(settings.allowed_origins.split(","))


@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")

    # Handle preflight OPTIONS requests
    if request.method == "OPTIONS":
        if origin in ALLOWED_ORIGINS:
            return JSONResponse(
                content={},
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "3600",
                },
            )

    response = await call_next(request)

    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"

    return response


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(tailor.router, prefix="/api/tailor", tags=["tailor"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "CareerPilot API"}
