import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.db.mongodb import client
from app.api.character import router as character_router
from app.api.auth import router as auth_router
from app.api.conversations import router as conversations_router

os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="Quirk AI API",
    version="0.1.0"
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/defaults", StaticFiles(directory="defaults"), name="defaults")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(character_router)
app.include_router(auth_router)
app.include_router(conversations_router)

@app.get("/")
def root():
    return {"message": "QuirkAI API is running!"}


@app.get("/health")
def health_check():
    try:
        client.admin.command("ping")

        return {
            "status": "ok",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "not connected",
            "error": str(e)
        }
