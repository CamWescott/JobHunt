import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.utils.auth import get_current_user
from app.services.supabase_client import get_supabase

router = APIRouter()


@router.post("/", response_model=ApplicationResponse)
async def create_application(
    request: ApplicationCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new job application entry."""
    app_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    supabase = get_supabase()
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

    result = supabase.table("applications").insert(data).execute()
    return result.data[0]


@router.get("/", response_model=list[ApplicationResponse])
async def list_applications(user: dict = Depends(get_current_user)):
    """List all applications for the current user."""
    supabase = get_supabase()
    result = (
        supabase.table("applications")
        .select("*")
        .eq("user_id", user["user_id"])
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/stats")
async def get_application_stats(user: dict = Depends(get_current_user)):
    """Get application statistics."""
    supabase = get_supabase()
    result = (
        supabase.table("applications")
        .select("status")
        .eq("user_id", user["user_id"])
        .execute()
    )

    stats = {
        "total": len(result.data),
        "saved": 0,
        "applied": 0,
        "phone_screen": 0,
        "interview": 0,
        "offer": 0,
        "rejected": 0,
        "withdrawn": 0,
    }
    for app in result.data:
        status = app["status"]
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
    supabase = get_supabase()
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

    result = (
        supabase.table("applications")
        .update(update_data)
        .eq("id", app_id)
        .eq("user_id", user["user_id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")

    return result.data[0]


@router.delete("/{app_id}")
async def delete_application(app_id: str, user: dict = Depends(get_current_user)):
    """Delete an application."""
    supabase = get_supabase()
    supabase.table("applications").delete().eq("id", app_id).eq(
        "user_id", user["user_id"]
    ).execute()
    return {"status": "deleted"}
