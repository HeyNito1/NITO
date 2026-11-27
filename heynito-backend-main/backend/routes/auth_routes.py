import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import DuplicateKeyError, PyMongoError

from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    TOKEN_EXPIRE_MINUTES
)

from backend.repositories.user_repository import (
    get_user_by_email,
    create_user
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

logger = logging.getLogger(__name__)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128
    )


@router.post("/signup", status_code=201)
def signup(request: SignupRequest):

    email = str(request.email).strip().lower()

    try:
        if get_user_by_email(email):
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        user = create_user(
            email=email,
            password_hash=hash_password(request.password)
        )

    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    except PyMongoError:
        logger.exception("MongoDB signup failed")

        raise HTTPException(
            status_code=503,
            detail="Unable to create account. Please try again."
        )

    return {
        "message": "Account created successfully",
        "user_id": user["_id"],
        "email": user["email"]
    }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=1,
        max_length=128
    )


@router.post("/login")
def login(request: LoginRequest):

    email = str(request.email).strip().lower()

    try:
        user = get_user_by_email(email)

    except PyMongoError:
        logger.exception("MongoDB login failed")

        raise HTTPException(
            status_code=503,
            detail="Database unavailable. Please try again."
        )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        request.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user["_id"])

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": TOKEN_EXPIRE_MINUTES * 60
    }