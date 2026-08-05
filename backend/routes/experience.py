import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.routes.videos import VIDEOS_DIR
from backend.services.image_matcher import match_painting
from backend.services import painting_db
from backend.services.speech_generator import generate_speech

router = APIRouter()


@router.post("/experience")
async def experience(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = match_painting(image_bytes)

    if not result.painting_id:
        if result.recognized_title:
            raise HTTPException(
                status_code=404,
                detail=f"Мы узнали «{result.recognized_title}» ({result.recognized_artist}), но не смогли добавить её в базу",
            )
        raise HTTPException(status_code=404, detail="Картина не распознана")

    painting = painting_db.get_painting(result.painting_id)
    generate_speech(painting["story"], result.painting_id)

    response_data = {
        "painting_id": result.painting_id,
        "title": painting["title"],
        "artist": painting["artist"],
        "artist_id": painting["artist_id"],
        "year": painting["year"],
        "story": painting["story"],
        "audio_url": f"/audio/{result.painting_id}",
        "artist_photo_url": f"/artist/{painting['artist_id']}",
        "video_url": ""
    }

    video_path = os.path.join(VIDEOS_DIR, f"{result.painting_id}.mp4")
    if os.path.exists(video_path):
        response_data["video_url"] = f"/video/{result.painting_id}"

    return response_data
