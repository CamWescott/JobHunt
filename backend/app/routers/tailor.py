import uuid
import base64
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse

from app.models.schemas import TailorRequest, TailorResponse, TailorResult
from app.models.schemas import InterviewPrepRequest, InterviewPrepResponse
from app.models.schemas import LinkedInOptimizeRequest, LinkedInOptimizeResponse
from app.utils.auth import get_current_user
from app.services.claude_service import tailor_resume, generate_interview_prep, optimize_linkedin
from app.services.pdf_export import export_resume_to_pdf, export_cover_letter_to_pdf
from app.services.firebase_client import get_db

router = APIRouter()

FREE_TIER_LIMIT = 3


async def check_usage(user: dict):
    """Check if user is within their usage limits."""
    db = get_db()

    # Check for active subscription
    subs = (
        db.collection("subscriptions")
        .where("user_id", "==", user["user_id"])
        .where("status", "==", "active")
        .limit(1)
        .stream()
    )
    if any(True for _ in subs):
        return  # Pro user, unlimited

    # Count free tier usage this month
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    usage_docs = (
        db.collection("tailor_results")
        .where("user_id", "==", user["user_id"])
        .where("created_at", ">=", month_start)
        .stream()
    )
    usage_count = sum(1 for _ in usage_docs)

    if usage_count >= FREE_TIER_LIMIT:
        raise HTTPException(
            status_code=403,
            detail=f"Free tier limit reached ({FREE_TIER_LIMIT}/month). Upgrade to Pro for unlimited access.",
        )


@router.post("/analyze", response_model=TailorResponse)
async def analyze_and_tailor(
    request: TailorRequest,
    user: dict = Depends(get_current_user),
):
    """Tailor a resume to a job description using Claude."""
    await check_usage(user)

    try:
        result = tailor_resume(request.resume_text, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    # Store result
    tailor_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db = get_db()
    db.collection("tailor_results").document(tailor_id).set(
        {
            "id": tailor_id,
            "user_id": user["user_id"],
            "resume_id": request.resume_id,
            "resume_text": request.resume_text,
            "job_description": request.job_description,
            "result": result,
            "created_at": now,
        }
    )

    return TailorResponse(
        id=tailor_id,
        result=TailorResult(**result),
        created_at=now,
    )


@router.get("/history", response_model=list[TailorResponse])
async def get_tailor_history(user: dict = Depends(get_current_user)):
    """Get all tailor results for the current user."""
    db = get_db()
    docs = (
        db.collection("tailor_results")
        .where("user_id", "==", user["user_id"])
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )
    results = []
    for doc in docs:
        d = doc.to_dict()
        results.append({
            "id": d["id"],
            "result": d["result"],
            "created_at": d["created_at"],
        })
    return results


@router.post("/export/resume-pdf")
async def export_resume_pdf(request: TailorRequest, user: dict = Depends(get_current_user)):
    """Export a tailored resume as PDF (returns base64-encoded)."""
    pdf_bytes = export_resume_to_pdf(request.resume_text)
    return JSONResponse(content={
        "data": base64.b64encode(pdf_bytes).decode("utf-8"),
        "filename": "tailored_resume.pdf",
    })


@router.post("/export/cover-letter-pdf")
async def export_cover_letter_pdf(request: TailorRequest, user: dict = Depends(get_current_user)):
    """Export a cover letter as PDF (returns base64-encoded)."""
    pdf_bytes = export_cover_letter_to_pdf(request.job_description)
    return JSONResponse(content={
        "data": base64.b64encode(pdf_bytes).decode("utf-8"),
        "filename": "cover_letter.pdf",
    })


@router.post("/interview-prep", response_model=InterviewPrepResponse)
async def interview_prep(
    request: InterviewPrepRequest,
    user: dict = Depends(get_current_user),
):
    """Generate interview prep based on resume and JD."""
    await check_usage(user)

    try:
        result = generate_interview_prep(request.resume_text, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    return InterviewPrepResponse(**result)


@router.post("/linkedin-optimize", response_model=LinkedInOptimizeResponse)
async def linkedin_optimize(
    request: LinkedInOptimizeRequest,
    user: dict = Depends(get_current_user),
):
    """Optimize LinkedIn profile sections."""
    await check_usage(user)

    try:
        result = optimize_linkedin(
            request.current_profile,
            request.target_role,
            request.job_description or "",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    return LinkedInOptimizeResponse(**result)
