from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

router = APIRouter()

ARTISTS_DIR = "backend/assets/artists"

@router.get("/artist/{id}")
def get_artist(id: str):
    filepath = f"{ARTISTS_DIR}/{id}.jpg"
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Художник не найден")
    return FileResponse(filepath, media_type="image/jpeg")
