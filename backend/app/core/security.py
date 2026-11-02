import hashlib
import hmac
import os
import base64
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from app.core.config import settings

# Built-in robust PBKDF2-HMAC-SHA256 password hashing (NIST SP 800-63B compliant)
# Guarantees zero C-extension compilation issues across any OS or Python version.
ITERATIONS = 1000 if settings.APP_ENV == "test" else 100000

def get_password_hash(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS)
    salt_b64 = base64.b64encode(salt).decode('ascii')
    key_b64 = base64.b64encode(key).decode('ascii')
    return f"pbkdf2_sha256${ITERATIONS}${salt_b64}${key_b64}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = base64.b64decode(parts[2].encode('ascii'))
        expected_key = base64.b64decode(parts[3].encode('ascii'))
        key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
        return hmac.compare_digest(key, expected_key)
    except Exception:
        return False

# Cryptographic token hashing for location shares
def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

def generate_random_token(length_bytes: int = 32) -> str:
    return base64.urlsafe_b64encode(os.urandom(length_bytes)).decode('ascii').rstrip('=')

# JWT token encoder/decoder using HMAC-SHA256
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        **to_encode,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    }
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode('utf-8')).decode('ascii').rstrip('=')
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode('utf-8')).decode('ascii').rstrip('=')
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    
    signature = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        signing_input,
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode('ascii').rstrip('=')
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode('utf-8'),
            signing_input,
            hashlib.sha256
        ).digest()
        
        # Add padding back if necessary
        sig_padding = len(sig_b64) % 4
        sig_to_check = sig_b64 + ('=' * (4 - sig_padding) if sig_padding else '')
        actual_sig = base64.urlsafe_b64decode(sig_to_check.encode('ascii'))
        
        if not hmac.compare_digest(actual_sig, expected_sig):
            return None
            
        payload_padding = len(payload_b64) % 4
        payload_json = base64.urlsafe_b64decode(payload_b64 + ('=' * (4 - payload_padding) if payload_padding else ''))
        payload = json.loads(payload_json.decode('utf-8'))
        
        # Check expiration
        exp = payload.get("exp")
        if exp and exp < time.time():
            return None
            
        return payload
    except Exception:
        return None
