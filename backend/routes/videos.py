from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

router = APIRouter()

VIDEOS_DIR = "backend/assets/videos"


@router.get("/video/{id}")
def get_video(id: str):
    filepath = f"{VIDEOS_DIR}/{id}.mp4"
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Видео не найдено")
    return FileResponse(filepath, media_type="video/mp4")