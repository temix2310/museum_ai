from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    return {"message": "фото получено", "filename": file.filename}
