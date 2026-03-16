"""
Auth Service — handles Supabase Auth sign-up, sign-in, and JWT verification.
"""
from database import get_supabase, get_supabase_admin
from schemas import UserOut, UserRole
from config import get_settings
from gotrue.errors import AuthApiError


async def sign_up(email: str, password: str, name: str, role: UserRole, business_id: str | None = None):
    """Register a new user with Supabase Auth and store profile in users table."""
    sb = get_supabase()
    admin = get_supabase_admin()

    # 1. Create auth user in Supabase Auth
    auth_response = sb.auth.sign_up({"email": email, "password": password})

    if not auth_response.user:
        raise Exception("Failed to create auth user")

    user_id = auth_response.user.id

    # 2. If owner, create a new business
    if role == UserRole.owner and not business_id:
        import uuid
        biz_id = str(uuid.uuid4())[:8]
        admin.table("businesses").insert({
            "id": biz_id,
            "name": f"{name}'s Business",
            "owner_id": user_id,
        }).execute()
        business_id = biz_id

    # 3. Default business for non-owners with no business_id
    if not business_id and role != UserRole.owner:
        # Try to find the default business
        default_biz = admin.table("businesses").select("id").limit(1).execute()
        if default_biz.data:
            business_id = default_biz.data[0]["id"]

    # 4. Insert user profile into the users table
    profile = {
        "id": user_id,
        "email": email,
        "name": name,
        "role": role.value,
        "business_id": business_id,
    }
    admin.table("users").insert(profile).execute()

    # If Supabase has email confirmation enabled, session will be None.
    # Auto sign-in to get a session token immediately.
    session = auth_response.session
    if session is None:
        try:
            login_response = sb.auth.sign_in_with_password(
                {"email": email, "password": password}
            )
            session = login_response.session
        except Exception:
            raise Exception(
                "Account created but email confirmation may be required. "
                "Please check your email or disable 'Confirm email' in "
                "Supabase Dashboard → Auth → Providers → Email."
            )

    return {
        "user": UserOut(**profile),
        "session": session,
    }


async def sign_in(email: str, password: str):
    """Sign in with email and password via Supabase Auth."""
    sb = get_supabase()
    admin = get_supabase_admin()

    auth_response = sb.auth.sign_in_with_password(
        {"email": email, "password": password}
    )

    if not auth_response.user:
        raise Exception("Invalid credentials")

    user_id = auth_response.user.id

    # Fetch user profile
    result = admin.table("users").select("*").eq("id", user_id).single().execute()
    user_data = result.data

    return {
        "user": UserOut(**user_data),
        "session": auth_response.session,
    }


async def get_current_user(access_token: str) -> UserOut:
    """Verify JWT and return the current user profile."""
    sb = get_supabase()
    admin = get_supabase_admin()

    # Verify the token with Supabase
    user_response = sb.auth.get_user(access_token)

    if not user_response.user:
        raise Exception("Invalid or expired token")

    user_id = user_response.user.id

    # Fetch profile
    result = admin.table("users").select("*").eq("id", user_id).single().execute()
    return UserOut(**result.data)


async def get_user_by_id(user_id: str) -> UserOut | None:
    """Fetch a user profile by ID."""
    admin = get_supabase_admin()
    result = admin.table("users").select("*").eq("id", user_id).execute()
    if result.data:
        return UserOut(**result.data[0])
    return None
