import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response

from app.models.schemas import TailorRequest, TailorResponse, TailorResult
from app.models.schemas import InterviewPrepRequest, InterviewPrepResponse
from app.models.schemas import LinkedInOptimizeRequest, LinkedInOptimizeResponse
from app.utils.auth import get_current_user
from app.services.claude_service import tailor_resume, generate_interview_prep, optimize_linkedin
from app.services.pdf_export import export_resume_to_pdf, export_cover_letter_to_pdf
from app.services.supabase_client import get_supabase

router = APIRouter()

FREE_TIER_LIMIT = 3


async def check_usage(user: dict):
    """Check if user is within their usage limits."""
    supabase = get_supabase()

    # Check for active subscription
    sub = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_id", user["user_id"])
        .eq("status", "active")
        .execute()
    )
    if sub.data:
        return  # Pro user, unlimited

    # Count free tier usage this month
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    usage = (
        supabase.table("tailor_results")
        .select("id", count="exact")
        .eq("user_id", user["user_id"])
        .gte("created_at", month_start)
        .execute()
    )

    if usage.count and usage.count >= FREE_TIER_LIMIT:
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

    supabase = get_supabase()
    supabase.table("tailor_results").insert(
        {
            "id": tailor_id,
            "user_id": user["user_id"],
            "resume_id": request.resume_id,
            "resume_text": request.resume_text,
            "job_description": request.job_description,
            "result": result,
            "created_at": now,
        }
    ).execute()

    return TailorResponse(
        id=tailor_id,
        result=TailorResult(**result),
        created_at=now,
    )


@router.get("/history", response_model=list[TailorResponse])
async def get_tailor_history(user: dict = Depends(get_current_user)):
    """Get all tailor results for the current user."""
    supabase = get_supabase()
    result = (
        supabase.table("tailor_results")
        .select("id, result, created_at")
        .eq("user_id", user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/export/resume-pdf")
async def export_resume_pdf(request: TailorRequest, user: dict = Depends(get_current_user)):
    """Export a tailored resume as PDF."""
    pdf_bytes = export_resume_to_pdf(request.resume_text)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=tailored_resume.pdf"},
    )


@router.post("/export/cover-letter-pdf")
async def export_cover_letter_pdf(request: TailorRequest, user: dict = Depends(get_current_user)):
    """Export a cover letter as PDF."""
    pdf_bytes = export_cover_letter_to_pdf(request.job_description)  # job_description field reused for cover letter text
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=cover_letter.pdf"},
    )


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
