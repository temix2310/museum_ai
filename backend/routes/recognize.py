from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.image_matcher import match_painting

router = APIRouter()


@router.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = match_painting(image_bytes)

    if result.painting_id:
        return {"painting_id": result.painting_id}

    if result.recognized_title:
        raise HTTPException(
            status_code=404,
            detail=f"Мы узнали «{result.recognized_title}» ({result.recognized_artist}), но не смогли добавить её в базу",
        )

    raise HTTPException(status_code=404, detail="Картина не распознана")
