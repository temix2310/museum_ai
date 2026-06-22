from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.image_matcher import match_painting

router = APIRouter()


@router.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    image_bytes = await file.read()
    painting_id = match_painting(image_bytes)

    if painting_id is None:
        raise HTTPException(status_code=404, detail="Картина не распознана")

    return {"painting_id": painting_id}
