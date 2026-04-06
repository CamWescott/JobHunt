from fastapi import APIRouter, Depends

from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Return the current authenticated user's info.

    With Firebase, signup/signin happen entirely on the client via the
    Firebase JS SDK.  The backend only needs to verify the ID token.
    This endpoint lets the frontend confirm the token is valid.
    """
    return {"user_id": user["user_id"], "email": user["email"]}
