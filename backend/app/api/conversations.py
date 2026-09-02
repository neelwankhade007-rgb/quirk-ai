from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.db.mongodb import db
from app.dependencies import get_current_user
from app.schemas.conversation import ConversationCreate
from app.schemas.message import MessageCreate


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


@router.post("/")
def create_conversation(
    conversation: ConversationCreate,
    current_user=Depends(get_current_user)
):
    try:
        character = db.characters.find_one({
            "_id": ObjectId(conversation.character_id)
        })
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid character ID"
        )

    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )

    # Check if conversation already exists
    existing_conv = db.conversations.find_one({
        "user_id": current_user["id"],
        "character_id": conversation.character_id
    })
    if existing_conv:
        return {
            "id": str(existing_conv["_id"]),
            "message": "Conversation already exists"
        }

    conversation_data = {
        "user_id": current_user["id"],
        "character_id": conversation.character_id,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.conversations.insert_one(conversation_data)
    conversation_id = str(result.inserted_id)

    # If character has a greeting, insert it into db.messages as the first message
    greeting = character.get("greeting")
    if greeting:
        db.messages.insert_one({
            "conversation_id": conversation_id,
            "sender": "character",
            "content": greeting,
            "created_at": datetime.now(timezone.utc)
        })

    return {
        "id": conversation_id,
        "message": "Conversation created successfully"
    }


@router.post("/messages")
def send_message(
    message: MessageCreate,
    current_user=Depends(get_current_user)
):
    try:
        character = db.characters.find_one({
            "_id": ObjectId(message.character_id)
        })
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid character ID"
        )

    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )

    conversation = db.conversations.find_one({
        "user_id": current_user["id"],
        "character_id": message.character_id
    })

    if not conversation:
        conversation_data = {
            "user_id": current_user["id"],
            "character_id": message.character_id,
            "created_at": datetime.now(timezone.utc)
        }

        result = db.conversations.insert_one(conversation_data)
        conversation_id = str(result.inserted_id)

        # If character has a greeting, insert it as the initial message
        greeting = character.get("greeting")
        if greeting:
            db.messages.insert_one({
                "conversation_id": conversation_id,
                "sender": "character",
                "content": greeting,
                "created_at": datetime.now(timezone.utc)
            })
    else:
        conversation_id = str(conversation["_id"])

    message_data = {
        "conversation_id": conversation_id,
        "sender": "user",
        "content": message.content,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.messages.insert_one(message_data)

    return {
        "conversation_id": str(conversation_id),
        "message_id": str(result.inserted_id),
        "message": "Message sent successfully"
    }


@router.get("/character/{character_id}")
@router.get("/characters/{character_id}")
def get_conversation(
    character_id: str,
    current_user=Depends(get_current_user)
):
    conversation = db.conversations.find_one({
        "user_id": current_user["id"],
        "character_id": character_id
    })

    if not conversation:
        return None

    return {
        "id": str(conversation["_id"]),
        "character_id": conversation["character_id"],
        "created_at": conversation.get("created_at")
    }


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    current_user=Depends(get_current_user)
):
    try:
        conversation = db.conversations.find_one({
            "_id": ObjectId(conversation_id)
        })
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid conversation ID"
        )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    if conversation["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this conversation"
        )

    messages = list(
        db.messages.find({
            "conversation_id": conversation_id
        }).sort("created_at", 1)
    )

    for message in messages:
        message_id_str = str(message["_id"])
        message["id"] = message_id_str
        message["_id"] = message_id_str
        del message["conversation_id"]

    return messages
