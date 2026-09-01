from fastapi import APIRouter, HTTPException
from pwdlib import PasswordHash

from app.db.mongodb import db
from app.schemas.auth import UserRegister


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