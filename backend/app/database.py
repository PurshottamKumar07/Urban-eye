from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    logger.info("Supabase connected successfully")
except Exception as e:
    logger.error(f"Failed to connect to Supabase: {e}")
    supabase = None

def get_supabase() -> Client:
    return supabase
