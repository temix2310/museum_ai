import io
import json
import re

from PIL import Image
from google import genai
from google.genai import types

from backend import config

MODEL = "gemini-flash-latest"
MAX_SIDE = 1024

client = genai.Client(api_key=config.GEMINI_API_KEY)

PROMPT = """Определи, какая известная картина изображена на фото.

Если ты уверенно узнаёшь всемирно известное произведение живописи — ответь
СТРОГО в формате JSON, без пояснений и без markdown-разметки:
{"recognized": true, "title": "Название на английском, как в англоязычной Википедии", "artist": "Имя художника на английском", "year": год_создания}

Если на фото не картина, или ты не можешь уверенно определить, какая именно
картина изображена — ответь:
{"recognized": false}

Ответь только JSON."""


def _resize(image_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    if max(image.size) > MAX_SIDE:
        image.thumbnail((MAX_SIDE, MAX_SIDE))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    return buffer.getvalue()


def _parse_json(text: str) -> dict | None:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def identify_painting(image_bytes: bytes) -> dict | None:
    resized = _resize(image_bytes)

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(data=resized, mime_type="image/jpeg"),
                PROMPT,
            ],
        )
    except Exception:
        return None

    data = _parse_json(response.text or "")

    if not data or not data.get("recognized"):
        return None

    return {
        "title": str(data.get("title", "")).strip(),
        "artist": str(data.get("artist", "")).strip(),
        "year": data.get("year"),
    }
