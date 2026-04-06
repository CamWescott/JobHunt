from supabase import create_client, Client
from app.config import get_settings


def get_supabase() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_auth_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)
