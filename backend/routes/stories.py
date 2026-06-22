import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

router = APIRouter()

with open("backend/database/paintings.json", encoding="utf-8") as f:
    data = json.load(f)

PAINTINGS = {p["id"]: p for p in data["paintings"]}


@router.get("/story/{id}")
def get_story(id: str):
    if id not in PAINTINGS:
        raise HTTPException(status_code=404, detail="Картина не найдена")
    result = {"id": id, "story": PAINTINGS[id]["story"]}
    return Response(
        content=json.dumps(result, ensure_ascii=False),
        media_type="application/json; charset=utf-8"
    )
