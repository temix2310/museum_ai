from PIL import Image
import imagehash
import io

ASSETS_DIR = "backend/assets/paintings"

PAINTINGS = {
    "mona_lisa": f"{ASSETS_DIR}/mona_lisa.jpg",
    "starry_night": f"{ASSETS_DIR}/starry_night.jpg",
}

THRESHOLD = 25


def match_painting(image_bytes: bytes) -> str | None:
    uploaded = imagehash.phash(Image.open(io.BytesIO(image_bytes)))

    best_match = None
    best_score = THRESHOLD

    for painting_id, path in PAINTINGS.items():
        try:
            reference = imagehash.phash(Image.open(path))
            diff = uploaded - reference
            if diff < best_score:
                best_score = diff
                best_match = painting_id
        except FileNotFoundError:
            continue

    return best_match
