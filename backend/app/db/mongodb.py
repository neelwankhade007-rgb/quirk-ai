import os

from dotenv import load_dotenv
from pymongo import MongoClient  # type: ignore[import-not-found]

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = "quirkai_db"

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]