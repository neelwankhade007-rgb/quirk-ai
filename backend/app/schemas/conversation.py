from pydantic import BaseModel


class ConversationCreate(BaseModel):
    character_id: str