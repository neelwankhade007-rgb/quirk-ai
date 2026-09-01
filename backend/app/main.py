from fastapi import FastAPI
from bson import ObjectId


from app.db.mongodb import client
from app.api.character import router as character_router
from app.api.auth import router as auth_router

app = FastAPI(
    title="Quirk AI API",
    version="0.1.0"
)

app.include_router(character_router)
app.include_router(auth_router)


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
