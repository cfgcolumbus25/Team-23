import os 
from dotenv import load_dotenv
load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")

