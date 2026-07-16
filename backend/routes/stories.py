import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from backend.services import painting_db

router = APIRouter()


@router.get("/story/{id}")
def get_story(id: str):
    painting = painting_db.get_painting(id)
    if painting is None:
        raise HTTPException(status_code=404, detail="Картина не найдена")
    result = {"id": id, "story": painting["story"]}
    return Response(
        content=json.dumps(result, ensure_ascii=False),
        media_type="application/json; charset=utf-8"
    )
