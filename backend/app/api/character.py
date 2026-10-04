from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends

from app.db.mongodb import db
from app.schemas.character import CharacterCreate, CharacterResponse
from app.dependencies import get_current_user


router = APIRouter(
    prefix="/characters",
    tags=["Characters"]
)


@router.post("/")
def create_character(
    character: CharacterCreate,
    current_user=Depends(get_current_user)
):
    character_data = character.model_dump()
    character_data["created_by"] = current_user["id"]

    result = db.characters.insert_one(character_data)

    return {
        "id": str(result.inserted_id),
        "message": "Character created successfully"
    }


import uuid
import os
from fastapi import UploadFile, File

@router.post("/upload-image")
def upload_character_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    # Validate extension and mime type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, WEBP are supported.")

    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid mime type.")

    # Unique filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", unique_filename)

    # Note: in a real production app we would enforce file size limit and validate content
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        
    return {
        "image_url": f"http://127.0.0.1:8000/uploads/{unique_filename}"
    }


@router.get("/", response_model=list[CharacterResponse])
def get_all_characters():
    characters = list(db.characters.find())

    for character in characters:
        character["id"] = str(character["_id"])
        del character["_id"]

    return characters


@router.get("/me", response_model=list[CharacterResponse])
def get_my_characters(
    current_user=Depends(get_current_user)
):
    characters = list(
        db.characters.find({
            "created_by": current_user["id"]
        })
    )

    for character in characters:
        character["id"] = str(character["_id"])
        del character["_id"]

    return characters


@router.put("/{character_id}")
def update_character(
    character_id: str,
    character: CharacterCreate,
    current_user=Depends(get_current_user)
):
    try:
        object_id = ObjectId(character_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid character ID format"
        )

    existing_character = db.characters.find_one({
        "_id": object_id
    })

    if not existing_character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )
    
    # if str(existing_character.get("created_by", "")) != str(current_user["id"]):
    #     raise HTTPException(
    #         status_code=403,
    #         detail="You are not authorized to update this character"
    #     )

    db.characters.update_one(
        {"_id": object_id},
        {"$set": character.model_dump()}
    )

    return {
        "message": "Character updated successfully"
    }


@router.delete("/{character_id}")
def delete_character(
    character_id: str,
    current_user=Depends(get_current_user)
):
    try:
        object_id = ObjectId(character_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid character ID format"
        )

    existing_character = db.characters.find_one({
        "_id": object_id
    })

    if not existing_character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )

    if str(existing_character.get("created_by", "")) != str(current_user["id"]):
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to delete this character"
        )

    db.characters.delete_one({"_id": object_id})

    return {
        "message": "Character deleted successfully"
    }


@router.get("/{character_id}", response_model=CharacterResponse)
def get_character(character_id: str):
    try:
        character = db.characters.find_one(
            {"_id": ObjectId(character_id)}
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid character ID format"
        )

    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )

    character["id"] = str(character["_id"])
    del character["_id"]

    return character