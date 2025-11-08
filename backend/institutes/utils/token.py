import jwt
import os
from datetime import datetime, timedelta
import uuid

def generate_magic_token(payload: dict, expires_in_hours: int = 48) -> str:
    """Generate a JWT token for magic link verification."""
    secret = os.getenv("JWT_SECRET_KEY", "default_secret")
    payload = {
        **payload,
        "exp": datetime.utcnow() + timedelta(hours=expires_in_hours),
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4())
    }
    return jwt.encode(payload, secret, algorithm="HS256")
