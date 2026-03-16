import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("supabase_anon") # Using the anon key provided by the user

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

# Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase():
    return supabase

# Fallback/Dummy for SQLModel sessions if needed by legacy code
def get_session():
    # This is now a no-op or returns something that routes can ignore 
    # if we refactor them to use get_supabase()
    yield None
def init_db():
    pass # Managed by Supabase dashboard/migration
