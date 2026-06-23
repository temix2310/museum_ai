from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
import json
from backend.services.image_matcher import match_painting
from backend.services.speech_generator import generate_speech

router = APIRouter()

with open("backend/database/paintings.json", encoding="utf-8") as f:
    data = json.load(f)

PAINTINGS = {p["id"]: p for p in data["paintings"]}


@router.post("/experience")
async def experience(file: UploadFile = File(...)):
    image_bytes = await file.read()
    painting_id = match_painting(image_bytes)

    if painting_id is None:
        raise HTTPException(status_code=404, detail="Картина не распознана")

    painting = PAINTINGS[painting_id]
    generate_speech(painting["story"], painting_id)

    result = {
        "painting_id": painting_id,
        "title": painting["title"],
        "artist": painting["artist"],
        "artist_id": painting["artist_id"],
        "year": painting["year"],
        "story": painting["story"],
        "audio_url": f"/audio/{painting_id}",
        "artist_photo_url": f"/artist/{painting['artist_id']}"
    }

    return Response(
        content=json.dumps(result, ensure_ascii=False),
        media_type="application/json; charset=utf-8"
    )
