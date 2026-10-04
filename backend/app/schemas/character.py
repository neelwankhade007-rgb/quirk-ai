from typing import Optional
from pydantic import BaseModel, Field

class CharacterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)  # Charactername
    description: str = Field(..., min_length=1, max_length=500)  # Short description shown to users
    personality: str = Field(..., min_length=1, max_length=2000)  # How the character behaves
    greeting: str = Field(..., min_length=1, max_length=1000)  # First message when the user starts chatting
    backstory: str = Field(..., min_length=1, max_length=5000)  # character history/context
    image_url: Optional[str] = Field(None, max_length=1000) # Optional character image
    avatar_type: Optional[str] = Field(None, max_length=50) # "custom" or "default"


class CharacterResponse(BaseModel):
    id: str
    name: str
    description: str
    personality: str
    greeting: str
    backstory: str
    created_by: str  # User ID of the creator
    image_url: Optional[str] = None
    avatar_type: Optional[str] = None