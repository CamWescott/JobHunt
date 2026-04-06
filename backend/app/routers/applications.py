import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.utils.auth import get_current_user
from app.services.firebase_client import get_db

router = APIRouter()


@router.post("/", response_model=ApplicationResponse)
async def create_application(
    request: ApplicationCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new job application entry."""
    app_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    data = {
        "id": app_id,
        "user_id": user["user_id"],
        "company": request.company,
        "position": request.position,
        "job_url": request.job_url,
        "job_description": request.job_description,
        "status": request.status.value,
        "notes": request.notes,
        "tailor_id": request.tailor_id,
        "created_at": now,
        "updated_at": now,
    }

    db = get_db()
    db.collection("applications").document(app_id).set(data)

    return data


@router.get("/", response_model=list[ApplicationResponse])
async def list_applications(user: dict = Depends(get_current_user)):
    """List all applications for the current user."""
    db = get_db()
    docs = (
        db.collection("applications")
        .where("user_id", "==", user["user_id"])
        .order_by("updated_at", direction="DESCENDING")
        .stream()
    )
    return [doc.to_dict() for doc in docs]


@router.get("/stats")
async def get_application_stats(user: dict = Depends(get_current_user)):
    """Get application statistics."""
    db = get_db()
    docs = (
        db.collection("applications")
        .where("user_id", "==", user["user_id"])
        .stream()
    )

    stats = {
        "total": 0,
        "saved": 0,
        "applied": 0,
        "phone_screen": 0,
        "interview": 0,
        "offer": 0,
        "rejected": 0,
        "withdrawn": 0,
    }
    for doc in docs:
        data = doc.to_dict()
        stats["total"] += 1
        status = data.get("status")
        if status in stats:
            stats[status] += 1

    return stats


@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    request: ApplicationUpdate,
    user: dict = Depends(get_current_user),
):
    """Update an application."""
    db = get_db()
    doc_ref = db.collection("applications").document(app_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Application not found")

    existing = doc.to_dict()
    if existing.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.now(timezone.utc).isoformat()
    update_data = {"updated_at": now}

    if request.company is not None:
        update_data["company"] = request.company
    if request.position is not None:
        update_data["position"] = request.position
    if request.job_url is not None:
        update_data["job_url"] = request.job_url
    if request.status is not None:
        update_data["status"] = request.status.value
    if request.notes is not None:
        update_data["notes"] = request.notes

    doc_ref.update(update_data)

    existing.update(update_data)
    return existing


@router.delete("/{app_id}")
async def delete_application(app_id: str, user: dict = Depends(get_current_user)):
    """Delete an application."""
    db = get_db()
    doc_ref = db.collection("applications").document(app_id)
    doc = doc_ref.get()

    if doc.exists and doc.to_dict().get("user_id") == user["user_id"]:
        doc_ref.delete()

    return {"status": "deleted"}
