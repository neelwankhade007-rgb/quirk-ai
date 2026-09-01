from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.db.mongodb import db
from app.schemas.character import CharacterCreate


router = APIRouter(
    prefix="/characters",
    tags=["Characters"]
)


@router.post("/")
def create_character(character: CharacterCreate):
    character_data = character.model_dump()

    result = db.characters.insert_one(character_data)

    return {
        "id": str(result.inserted_id),
        "message": "Character created successfully"
    }

@router.get("/")
def get_all_characters():
    characters = list(db.characters.find())
    
    for character in characters:
        character["id"] = str(character["_id"])
        del character["_id"]  # Remove the '_id' field

    return characters

@router.get("/{character_id}")
def get_character(character_id: str):
    try:
        character = db.characters.find_one(
            {"_id": ObjectId(character_id)}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid character ID format")

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    character["id"] = str(character["_id"])
    del character["_id"]  # Remove the '_id' field

    return character