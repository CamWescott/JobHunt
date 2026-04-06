from fastapi import APIRouter, HTTPException

from app.models.schemas import SignUpRequest, SignInRequest, AuthResponse
from app.services.supabase_client import get_supabase_auth_client

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    """Register a new user."""
    try:
        client = get_supabase_auth_client()
        response = client.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {"data": {"full_name": request.full_name}},
            }
        )
        if not response.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        return AuthResponse(
            access_token=response.session.access_token if response.session else "",
            user_id=response.user.id,
            email=response.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    """Sign in an existing user."""
    try:
        client = get_supabase_auth_client()
        response = client.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )
        return AuthResponse(
            access_token=response.session.access_token,
            user_id=response.user.id,
            email=response.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")
