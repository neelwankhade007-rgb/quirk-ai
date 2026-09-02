from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.db.mongodb import client

from app.api.character import router as character_router
from app.api.auth import router as auth_router
from app.api.conversations import router as conversations_router

app = FastAPI(
    title="Quirk AI API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
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
