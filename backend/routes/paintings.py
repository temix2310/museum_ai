import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

router = APIRouter()

with open("backend/database/paintings.json", encoding="utf-8") as f:
    data = json.load(f)

PAINTINGS = {p["id"]: p for p in data["paintings"]}


@router.get("/painting/{id}")
def get_painting(id: str):
    if id not in PAINTINGS:
        raise HTTPException(status_code=404, detail="Картина не найдена")
    return Response(
        content=json.dumps(PAINTINGS[id], ensure_ascii=False),
        media_type="application/json; charset=utf-8"
    )
