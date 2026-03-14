"""
Auth Router — login, register, current user.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut
from services import auth_service
from events.emitter import emit_event

router = APIRouter(prefix="/auth", tags=["Auth"])


async def get_current_user(authorization: str = Header(...)) -> UserOut:
    """Dependency to extract and verify the current user from the Authorization header."""
    try:
        token = authorization.replace("Bearer ", "")
        return await auth_service.get_current_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """Sign in with email and password."""
    try:
        result = await auth_service.sign_in(body.email, body.password)

        # Emit user logged-in event for auditing / notifications
        await emit_event("user_logged_in", {
            "email": body.email,
            "user_id": result["user"].id,
        })

        return TokenResponse(
            access_token=result["session"].access_token,
            user=result["user"],
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    """Register a new user."""
    try:
        result = await auth_service.sign_up(
            email=body.email,
            password=body.password,
            name=body.name,
            role=body.role,
            business_id=body.business_id,
        )

        # Emit user registered event for auditing / notifications
        await emit_event("user_registered", {
            "email": body.email,
            "name": body.name,
            "role": body.role,
            "user_id": result["user"].id,
        })

        return TokenResponse(
            access_token=result["session"].access_token,
            user=result["user"],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserOut)
async def me(current_user: UserOut = Depends(get_current_user)):
    """Get the current authenticated user."""
    return current_user
