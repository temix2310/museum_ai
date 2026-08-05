import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

ARTISTS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "artists")
PLACEHOLDER_PATH = os.path.join(ARTISTS_DIR, "placeholder.jpg")


@router.get("/artist/{id}")
def get_artist(id: str):
    filepath = os.path.join(ARTISTS_DIR, f"{id}.jpg")
    if not os.path.exists(filepath):
        if not os.path.exists(PLACEHOLDER_PATH):
            raise HTTPException(status_code=404, detail="Художник не найден")
        filepath = PLACEHOLDER_PATH
    return FileResponse(filepath, media_type="image/jpeg")
