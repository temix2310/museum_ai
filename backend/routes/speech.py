import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from backend.services.speech_generator import generate_speech
from backend.services import painting_db

router = APIRouter()

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")


@router.post("/speech/{id}")
def create_speech(id: str):
    painting = painting_db.get_painting(id)
    if painting is None:
        raise HTTPException(status_code=404, detail="Картина не найдена")
    filepath = generate_speech(painting["story"], id)
    return FileResponse(filepath, media_type="audio/mpeg")


@router.get("/audio/{id}")
def get_audio(id: str):
    filepath = os.path.join(AUDIO_DIR, f"{id}.mp3")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Аудио не найдено")
    return FileResponse(filepath, media_type="audio/mpeg")
