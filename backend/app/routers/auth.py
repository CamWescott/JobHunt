from fastapi import APIRouter, Depends
from firebase_admin import auth as firebase_auth

from app.utils.auth import get_current_user
from app.services.firebase_client import get_db

router = APIRouter()


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Return the current authenticated user's info.

    With Firebase, signup/signin happen entirely on the client via the
    Firebase JS SDK.  The backend only needs to verify the ID token.
    This endpoint lets the frontend confirm the token is valid.
    """
    return {"user_id": user["user_id"], "email": user["email"]}


@router.delete("/delete-account")
async def delete_account(user: dict = Depends(get_current_user)):
    """Delete the user's account and all associated data."""
    db = get_db()
    user_id = user["user_id"]

    # Delete all user data from Firestore collections
    collections = ["tailor_results", "resumes", "applications", "subscriptions"]
    for collection_name in collections:
        docs = db.collection(collection_name).where("user_id", "==", user_id).stream()
        for doc in docs:
            doc.reference.delete()

    # Delete the user from Firebase Auth
    try:
        firebase_auth.delete_user(user_id)
    except Exception:
        pass  # User may already be deleted from Auth

    return {"status": "ok", "message": "Account and all data deleted"}
