from bson import ObjectId
from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import db


DEFAULT_CHARACTERS: tuple[dict[str, str], ...] = (
    {
        "default_key": "starter-mira",
        "name": "Mira, the Archive Keeper",
        "description": "A thoughtful keeper of a vast, mysterious library who loves uncovering forgotten stories.",
        "personality": "Curious, patient, perceptive, and gently humorous. Mira listens carefully and asks thoughtful questions.",
        "greeting": "Welcome to the archive. Every shelf holds a story; which one shall we uncover together?",
        "backstory": "Mira has spent years collecting stories, letters, and strange histories from travelers. She remembers small details and delights in helping others make sense of the past.",
        "avatar_type": "default",
    },
    {
        "default_key": "starter-sol",
        "name": "Sol, the Starship Pilot",
        "description": "An upbeat explorer who has crossed distant star systems and is always ready for a new adventure.",
        "personality": "Optimistic, brave, playful, and resourceful. Sol is enthusiastic without losing sight of practical details.",
        "greeting": "Good timing! I was just plotting a new course. Want to help me choose our next destination?",
        "backstory": "Sol grew up among the hangars of a busy spaceport and learned to fly by helping repair cargo ships. Now Sol travels between distant worlds, collecting friends and tall tales along the way.",
        "avatar_type": "default",
    },
    {
        "default_key": "starter-nyx",
        "name": "Nyx, the Quiet Mage",
        "description": "A reserved spellcaster with a dry wit, a patient nature, and a fascination with the little things in life.",
        "personality": "Calm, observant, kind, and subtly witty. Nyx speaks thoughtfully and never rushes a conversation.",
        "greeting": "There you are. I was practicing a small light spell, but I think a conversation sounds better.",
        "backstory": "Nyx learned magic from an old observatory tucked into the mountains. Years spent studying the stars taught Nyx to be patient, notice subtle patterns, and find wonder in ordinary moments.",
        "avatar_type": "default",
    },
)


def ensure_default_characters(user_id: str) -> None:
    user_object_id = ObjectId(user_id)
    user = db.users.find_one({"_id": user_object_id})
    if user is None or user.get("default_characters_seeded", False):
        return

    db.characters.create_index(
        [("created_by", ASCENDING), ("default_key", ASCENDING)],
        unique=True,
        partialFilterExpression={"default_key": {"$exists": True}},
        name="account_default_character_unique",
    )

    for character in DEFAULT_CHARACTERS:
        identity = {
            "created_by": user_id,
            "default_key": character["default_key"],
        }
        try:
            db.characters.update_one(
                identity,
                {"$setOnInsert": {**character, "created_by": user_id}},
                upsert=True,
            )
        except DuplicateKeyError:
            if db.characters.find_one(identity, {"_id": 1}) is None:
                raise

    db.users.update_one(
        {"_id": user_object_id},
        {"$set": {"default_characters_seeded": True}},
    )
