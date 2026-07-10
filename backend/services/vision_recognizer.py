import base64
import io
import json
import re

from PIL import Image
from anthropic import Anthropic

from backend import config

MODEL = "claude-sonnet-5"
MAX_SIDE = 1024

client = Anthropic(api_key=config.ANTHROPIC_API_KEY)

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
    """Просит Claude определить картину на фото.

    Возвращает {"title": ..., "artist": ..., "year": ...} если Claude уверенно
    узнала произведение, иначе None (не картина / не удалось распознать / сбой сети).
    """
    b64 = base64.standard_b64encode(_resize(image_bytes)).decode("utf-8")

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": "image/jpeg", "data": b64},
                    },
                    {"type": "text", "text": PROMPT},
                ],
            }],
        )
    except Exception:
        return None

    text = next((block.text for block in response.content if block.type == "text"), "")
    data = _parse_json(text)

    if not data or not data.get("recognized"):
        return None

    return {
        "title": str(data.get("title", "")).strip(),
        "artist": str(data.get("artist", "")).strip(),
        "year": data.get("year"),
    }
