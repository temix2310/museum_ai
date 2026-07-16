import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from backend.services import painting_db

router = APIRouter()


@router.get("/painting/{id}")
def get_painting(id: str):
    painting = painting_db.get_painting(id)
    if painting is None:
        raise HTTPException(status_code=404, detail="Картина не найдена")
    return Response(
        content=json.dumps(painting, ensure_ascii=False),
        media_type="application/json; charset=utf-8"
    )
