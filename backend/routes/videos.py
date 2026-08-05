import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "videos")


@router.get("/video/{id}")
def get_video(id: str):
    filepath = os.path.join(VIDEOS_DIR, f"{id}.mp4")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Видео не найдено")
    return FileResponse(filepath, media_type="video/mp4")