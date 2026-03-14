"""
Supabase client singleton for database operations.
"""
from supabase import create_client, Client
from config import get_settings

_supabase_client: Client | None = None
_supabase_admin: Client | None = None


def get_supabase() -> Client:
    """Get the Supabase client using the anon key (respects RLS)."""
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client


def get_supabase_admin() -> Client:
    """Get the Supabase client using the service role key (bypasses RLS)."""
    global _supabase_admin
    if _supabase_admin is None:
        settings = get_settings()
        _supabase_admin = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
        )
    return _supabase_admin
