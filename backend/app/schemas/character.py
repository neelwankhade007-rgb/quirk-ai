from pydantic import BaseModel, Field

class CharacterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)  # Charactername
    description: str = Field(..., min_length=1, max_length=500)  # Short description shown to users
    personality: str = Field(..., min_length=1, max_length=2000)  # How the character behaves
    greeting: str = Field(..., min_length=1, max_length=1000)  # First message when the user starts chatting
    backstory: str = Field(..., min_length=1, max_length=5000)  # character history/context