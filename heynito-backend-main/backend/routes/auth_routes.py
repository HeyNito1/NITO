from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from backend.auth import ( hash_password, verify_password, create_access_token )

from backend.database import SessionLocal
from backend.models import User
from backend.auth import hash_password

router = APIRouter(prefix="/auth", tags=["Authentication"]) # every api of authentication will 
# come with prefix /auth and Authentication tag ke under come all auth apis


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


@router.post("/signup", status_code=201)
def signup(request: SignupRequest):
    with SessionLocal() as session: # to check in the db -- that user pehle se toh ni exist in the db 
        existing_user = session.scalar(
            select(User).where(User.email == request.email)
        )

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        user = User(
            id=str(__import__("uuid").uuid4()),
            email=str(request.email).lower(),
            password_hash=hash_password(request.password)
        )

        try:
            session.add(user)  # in the database adding 
            session.commit()
            session.refresh(user)
        except Exception:
            session.rollback()
            raise HTTPException(
                status_code=500,
                detail="Could not create account"
            )

        return {
            "message": "Account created successfully",
            "user_id": user.id,
            "email": user.email
        }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)



@router.post("/login")
def login(request: LoginRequest):
    with SessionLocal() as session:
        user = session.scalar(
            select(User).where(
                User.email == str(request.email).lower()
            )
        )

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="Account does not exist. Please sign up to create a new account."
            )

        if not verify_password(
            request.password, user.password_hash
        ):
            raise HTTPException(
                status_code=401,
                detail="Incorrect password. Please try again."
            )

        token = create_access_token(user.id)

        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 3600
        }
