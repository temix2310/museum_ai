import re
import difflib
from dataclasses import dataclass
from typing import Optional

from backend.services import painting_db
from backend.services.vision_recognizer import identify_painting
from backend.services.story_generator import generate_story


def _normalize(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _slugify(text: str) -> str:
    return re.sub(r"\s+", "_", _normalize(text))


def _build_index():
    index = {}
    titles = []
    title_to_id = {}
    for pid, p in painting_db.PAINTINGS.items():
        norm_title = _normalize(p["title"])
        index[(norm_title, _normalize(p["artist"]))] = pid
        titles.append(norm_title)
        title_to_id[norm_title] = pid
    return index, titles, title_to_id

_INDEX, _TITLES, _TITLE_TO_ID = _build_index()


@dataclass
class MatchResult:
    painting_id: Optional[str] = None
    recognized_title: Optional[str] = None
    recognized_artist: Optional[str] = None


def _remember(entry: dict) -> None:
    """Добавляет новую картину в индекс в памяти, чтобы повторное
    сканирование находило её мгновенно, без обращения к диску."""
    pid = entry["id"]
    norm_title = _normalize(entry["title"])
    _INDEX[(norm_title, _normalize(entry["artist"]))] = pid
    _TITLES.append(norm_title)
    _TITLE_TO_ID[norm_title] = pid


def match_painting(image_bytes: bytes) -> MatchResult:
    recognized = identify_painting(image_bytes)

    if recognized is None:
        return MatchResult()

    title = recognized["title"]
    artist = recognized["artist"]
    key = (_normalize(title), _normalize(artist))

    painting_id = _INDEX.get(key)

    if painting_id is None:
        close = difflib.get_close_matches(_normalize(title), _TITLES, n=1, cutoff=0.6)
        if close:
            painting_id = _TITLE_TO_ID[close[0]]

    if painting_id is None:
        story = generate_story(title, artist, recognized.get("year"))
        if story:
            entry = {
                "id": _slugify(title),
                "title": title,
                "artist": artist,
                "artist_id": _slugify(artist),
                "year": recognized.get("year"),
                "story": story,
            }
            painting_db.add_painting(entry)
            _remember(entry)
            painting_id = entry["id"]

    return MatchResult(
        painting_id=painting_id,
        recognized_title=title,
        recognized_artist=artist,
    )
