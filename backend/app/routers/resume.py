import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException

from app.models.schemas import ResumeResponse
from app.utils.auth import get_current_user
from app.utils.resume_parser import parse_resume
from app.services.firebase_client import get_db

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

    # Store in Firestore
    resume_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    db = get_db()
    db.collection("resumes").document(resume_id).set(
        {
            "id": resume_id,
            "user_id": user["user_id"],
            "filename": file.filename,
            "raw_text": raw_text,
            "created_at": now,
        }
    )

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
    db = get_db()
    docs = (
        db.collection("resumes")
        .where("user_id", "==", user["user_id"])
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )
    return [doc.to_dict() for doc in docs]


@router.delete("/{resume_id}")
async def delete_resume(resume_id: str, user: dict = Depends(get_current_user)):
    """Delete a resume."""
    db = get_db()
    doc_ref = db.collection("resumes").document(resume_id)
    doc = doc_ref.get()

    if doc.exists and doc.to_dict().get("user_id") == user["user_id"]:
        doc_ref.delete()

    return {"status": "deleted"}
