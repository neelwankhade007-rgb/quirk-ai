import os

from dotenv import load_dotenv
from pymongo import MongoClient  # type: ignore[import-not-found]

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = "quirkai_db"

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

try:
    client.admin.command("ping")
    print(f"✓ MongoDB connected successfully | Database: {DATABASE_NAME}")
except Exception as error:
    print(f"✗ MongoDB connection failed: {error}")