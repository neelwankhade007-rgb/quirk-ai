import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, Depends
from pwdlib import PasswordHash

from app.db.mongodb import db
from app.schemas.auth import UserRegister, UserLogin
from app.dependencies import get_current_user


JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"


def create_access_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

password_hasher = PasswordHash.recommended()


@router.post("/register")
def register_user(user: UserRegister):
    existing_user = db.users.find_one({
        "$or": [
            {"username": user.username},
            {"email": user.email}
        ]
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )

    hashed_password = password_hasher.hash(user.password)

    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password
    }

    result = db.users.insert_one(user_data)

    return {
        "id": str(result.inserted_id),
        "username": user.username,
        "email": user.email
    }


@router.post("/login")
def login_user(user: UserLogin):
    existing_user = db.users.find_one({
        "username": user.username
    })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    password_valid = password_hasher.verify(
        user.password,
        existing_user["password"]
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        str(existing_user["_id"])
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful",
        "user": {
            "id": str(existing_user["_id"]),
            "username": existing_user["username"],
            "email": existing_user["email"]
        }
    }


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user