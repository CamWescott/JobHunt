import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from app.models.schemas import ResumeResponse
from app.utils.auth import get_current_user
from app.utils.resume_parser import parse_resume
from app.services.supabase_client import get_supabase

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload and parse a resume file (PDF, DOCX, or TXT)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    try:
        raw_text = parse_resume(contents, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse resume")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    # Store in Supabase
    resume_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    supabase = get_supabase()
    supabase.table("resumes").insert(
        {
            "id": resume_id,
            "user_id": user["user_id"],
            "filename": file.filename,
            "raw_text": raw_text,
            "created_at": now,
        }
    ).execute()

    return ResumeResponse(
        id=resume_id,
        user_id=user["user_id"],
        filename=file.filename,
        raw_text=raw_text,
        created_at=now,
    )


@router.get("/list", response_model=list[ResumeResponse])
async def list_resumes(user: dict = Depends(get_current_user)):
    """List all resumes for the current user."""
    supabase = get_supabase()
    result = (
        supabase.table("resumes")
        .select("*")
        .eq("user_id", user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.delete("/{resume_id}")
async def delete_resume(resume_id: str, user: dict = Depends(get_current_user)):
    """Delete a resume."""
    supabase = get_supabase()
    supabase.table("resumes").delete().eq("id", resume_id).eq(
        "user_id", user["user_id"]
    ).execute()
    return {"status": "deleted"}
