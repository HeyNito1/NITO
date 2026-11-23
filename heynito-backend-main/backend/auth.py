from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


bearer_scheme = HTTPBearer()

from backend.config import JWT_SECRET_KEY

ALGORITHM = "HS256" # JWT token creation algo 
TOKEN_EXPIRE_MINUTES = 2880   # after that again login 

password_hash = PasswordHash.recommended() # Password hashing tool ready

# hashing the password 
def hash_password(password: str) -> str:
    return password_hash.hash(password)

# verifying the hashed password ( stored in the database ) with the password entered by the user 
def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)

# jwt token creation 
def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "exp": expire
    }

    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme) ) -> str: 
    credentials_error = HTTPException(  # if token invalid ! 
        status_code=401,
        detail="Invalid or expired authentication token"
    )

    try:
        payload = jwt.decode(  # jwt validate 
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub") # user id fetch 

        if not user_id:
            raise credentials_error

        return user_id

    except jwt.InvalidTokenError:
        raise credentials_error