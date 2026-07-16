import json
import os

CURATED_PATH = "backend/database/paintings.json"
GENERATED_PATH = "backend/database/generated_paintings.json"


def _load(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    with open (path, encoding="utf-8") as f:
        return json.load(f).get("paintings", [])


def _save_generated(paintings: list[dict]) -> None:
    with open(GENERATED_PATH, "w", encoding="utf-8") as f:
        json.dump({"paintings": paintings}, f, ensure_ascii=False, indent=2)


_curated = _load(CURATED_PATH)
_generated = _load(GENERATED_PATH)

PAINTINGS = {p["id"]: p for p in _curated}
PAINTINGS.update({p["id"]: p for p in _generated})


def get_painting(painting_id: str) -> dict | None:
    return PAINTINGS.get(painting_id)


def add_painting(entry: dict) -> None:
    """Сохраняет новую (автосгенерированную) картину — и в памяти, и на диске."""
    PAINTINGS[entry["id"]] = entry
    _generated.append(entry)
    _save_generated(_generated)
