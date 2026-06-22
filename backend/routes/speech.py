import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from backend.services.speech_generator import generate_speech

router = APIRouter()

with open("backend/database/paintings.json", encoding="utf-8") as f:
    data = json.load(f)

PAINTINGS = {p["id"]: p for p in data["paintings"]}


@router.post("/speech/{id}")
def create_speech(id: str):
    if id not in PAINTINGS:
        raise HTTPException(status_code=404, detail="Картина не найдена")
    filepath = generate_speech(PAINTINGS[id]["story"], id)
    return FileResponse(filepath, media_type="audio/mpeg")
