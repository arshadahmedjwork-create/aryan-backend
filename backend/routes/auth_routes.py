from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from database.db import get_supabase
from utils.auth import create_access_token, get_password_hash, verify_password, decode_access_token
from models.models import User, UserBase
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Hardcoded Users for immediate reliability
HARDCODED_USERS = {
    "admin@autonomiq.ai": {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "admin@autonomiq.ai",
        "password": "admin123",
        "role": "admin",
        "full_name": "System Admin"
    },
    "customer@gmail.com": {
        "id": "00000000-0000-0000-0000-000000000002",
        "email": "customer@gmail.com",
        "password": "cust123",
        "role": "customer",
        "full_name": "Jane Customer"
    },
    "driver@autonomiq.ai": {
        "id": "00000000-0000-0000-0000-000000000003",
        "email": "driver@autonomiq.ai",
        "password": "driver123",
        "role": "driver",
        "full_name": "John Driver"
    }
}

async def get_current_user(token: str = Depends(oauth2_scheme), supabase = Depends(get_supabase)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    role = payload.get("role")
    
    # Check hardcoded first
    for email, u_data in HARDCODED_USERS.items():
        if u_data["id"] == user_id:
            return User(id=u_data["id"], email=email, role=u_data["role"], full_name=u_data["full_name"])

    # Fallback to Supabase
    try:
        res = supabase.table("users").select("*").eq("id", user_id).execute()
        if res.data:
            return User(**res.data[0])
    except Exception as e:
        print(f"Auth DB Error: {e}")
    
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

@router.post("/register")
async def register(user_data: UserBase, password: str, supabase = Depends(get_supabase)):
    # Check if user already exists in hardcoded
    if user_data.email in HARDCODED_USERS:
        raise HTTPException(status_code=400, detail="Email already registered (System)")
    
    # Check if user already exists in Supabase
    try:
        res = supabase.table("users").select("*").eq("email", user_data.email).execute()
        if res.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        new_user_data = {
            "email": user_data.email,
            "role": user_data.role,
            "full_name": user_data.full_name,
            "password_hash": get_password_hash(password)
        }
        
        res = supabase.table("users").insert(new_user_data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to register user")
            
        return {"message": "User registered successfully", "user_id": res.data[0]["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), supabase = Depends(get_supabase)):
    # 1. Check Hardcoded
    if form_data.username in HARDCODED_USERS:
        h_user = HARDCODED_USERS[form_data.username]
        if form_data.password == h_user["password"]:
            access_token = create_access_token(data={"sub": h_user["id"], "role": h_user["role"]})
            return {"access_token": access_token, "token_type": "bearer", "role": h_user["role"]}
    
    # 2. Check Supabase
    try:
        res = supabase.table("users").select("*").eq("email", form_data.username).execute()
        if res.data:
            user = res.data[0]
            if verify_password(form_data.password, user["password_hash"]):
                access_token = create_access_token(data={"sub": str(user["id"]), "role": user["role"]})
                return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}
    except Exception as e:
        print(f"Login DB Error: {e}")
        # If DB fails, we still checked hardcoded above. 
        # If we reach here, it's a real failure
        raise HTTPException(status_code=500, detail=f"Database error during login: {str(e)}")
    
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/drivers")
async def list_drivers(supabase = Depends(get_supabase)):
    res = supabase.table("users").select("id, full_name, email").eq("role", "driver").execute()
    return res.data
