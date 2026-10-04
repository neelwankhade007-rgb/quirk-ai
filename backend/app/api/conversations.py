from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from typing import cast
from groq.types.chat import ChatCompletionMessageParam

from app.db.mongodb import db
from app.dependencies import get_current_user
from app.schemas.conversation import ConversationCreate
from app.schemas.message import MessageCreate
from app.services.llm import generate_response


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
async def send_message(
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

    history = list(
        db.messages.find(
            {"conversation_id": conversation_id}
        ).sort("created_at", 1)
    )

    llm_messages: list[ChatCompletionMessageParam] = [
        {
            "role": "system",
            "content": f"""
You are {character["name"]}.

Personality:
{character.get("personality", "")}

Backstory:
{character.get("backstory", "")}

You are participating in a natural character conversation.

CHARACTER BEHAVIOR:
- Stay in character at all times.
- Behave like a real person rather than an assistant or narrator.
- Let your personality naturally influence your wording, reactions, humor, emotions, and behavior.
- Remember and use relevant details from the conversation.
- React to what the user actually says instead of producing generic responses.
- Do not repeat information unnecessarily.
- Do not turn simple messages into long speeches or essays.
- Match the natural length and energy of the conversation.
- A simple message should usually receive a simple, natural response.
- Give longer responses when the conversation genuinely calls for them.
- Do not force every response to contain actions or narration.
- Do not force every response to contain dialogue, actions, and narrative together.
- Let the situation determine what is appropriate.

RESPONSE FORMAT:

The response format is flexible. Do not follow a fixed structure.

Dialogue:
- Spoken dialogue should be enclosed in double quotation marks.
- Example: "I didn't say that."

Actions:
- Physical actions, expressions, gestures, or character behavior should be enclosed in double asterisks.
- Example: **She rolls her eyes.**
- Actions are optional. Do not force an action into every response.

FORMATTING RULES:
- For physical actions, ALWAYS use double asterisks: **action**
- NEVER use single asterisks for actions.
- Do not use Markdown italics.
- Do not wrap entire dialogue lines in asterisks.
- Spoken dialogue should use double quotation marks.
- Keep actions and dialogue visually separate when both are present.

Narrative / Context:
- Normal text may be used for scene context, narration, or environmental details when it genuinely adds to the interaction.
- Narrative is optional and should not be forced into ordinary conversation.
- Do not describe the user's actions, thoughts, feelings, or decisions unless the user has explicitly established them.

STRUCTURE:
- A response may contain only dialogue.
- A response may contain only an action.
- A response may contain dialogue followed by an action.
- A response may contain an action followed by dialogue.
- A response may contain multiple actions and dialogue.
- A response may contain contextual narration when appropriate.
- Do not always use the same structure.
- Do not automatically begin every response with an action.
- Do not automatically end every response with dialogue.
- Let the current situation determine the structure.

CONVERSATION STYLE:
- Keep responses natural and appropriately sized for the current conversation.
- Simple messages should usually receive simple responses.
- Do not turn casual conversation into speeches or essays.
- Longer responses are appropriate only when the situation genuinely calls for them.
- Do not artificially extend the conversation.
- Do not narrate every movement or facial expression.
- Avoid repetitive actions such as constantly writing "she smiles", "she nods", or similar descriptions.
- React specifically to what the user said.
- Make the character feel like a real person having a conversation, not a narrator following a template.

Examples:

Simple dialogue:
"Yeah, I'm fine. What about you?"

Action only:
**She glances toward the door.**

Action followed by dialogue:
**She raises an eyebrow.**
"You're seriously asking me that?"

Dialogue followed by action:
"Of course I remember."
**She gives you a faint smile.**

Multiple beats:
**She checks the time.**
"Already this late?"
**She grabs her bag.**
"Come on."

Context when appropriate:
The tavern gradually grows quieter as the evening crowd begins to leave.

Do not copy these examples literally. Choose the structure that naturally fits the current conversation.

Do not mention that you are an AI unless the conversation specifically requires it.
"""
        }
    ]

    for msg in history:
        llm_messages.append(
            cast(
                ChatCompletionMessageParam,
                {
                    "role": "assistant" if msg["sender"] == "character" else "user",
                    "content": msg["content"]
                }
            )
        )

    # Generate character response
    ai_response = await generate_response(
        llm_messages,
        provider="xkiro"
    )

    ai_message_data = {
        "conversation_id": conversation_id,
        "sender": "character",
        "content": ai_response,
        "created_at": datetime.now(timezone.utc)
    }

    ai_result = db.messages.insert_one(ai_message_data)

    return {
        "conversation_id": conversation_id,
        "message_id": str(result.inserted_id),
        "ai_message_id": str(ai_result.inserted_id),
        "ai_response": ai_response
    }
    


@router.get("/")
def get_conversations(current_user=Depends(get_current_user)):
    conversations = list(
        db.conversations.find(
            {"user_id": current_user["id"]}
        ).sort("created_at", -1)
    )

    result = []
    for conversation in conversations:
        try:
            character = db.characters.find_one(
                {"_id": ObjectId(conversation["character_id"])}
            )
        except Exception:
            character = None

        if not character:
            continue

        character["id"] = str(character["_id"])
        del character["_id"]
        result.append({
            "id": str(conversation["_id"]),
            "character": character,
            "created_at": conversation.get("created_at"),
        })

    return result


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
