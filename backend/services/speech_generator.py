import os
import requests

from backend import config

AUDIO_DIR = "backend/assets/audio"
TTS_URL = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize"


def generate_speech(text: str, painting_id: str) -> str:
    os.makedirs(AUDIO_DIR, exist_ok=True)
    filepath = f"{AUDIO_DIR}/{painting_id}.mp3"

    response = requests.post(
        TTS_URL,
        headers={"Authorization": f"Api-Key {config.YANDEX_API_KEY}"},
        data={
            "text": text,
            "lang": "ru-RU",
            "voice": "ermil",
            "format": "mp3",
            "folderId": config.YANDEX_FOLDER_ID,
        },
    )
    response.raise_for_status()

    with open(filepath, "wb") as f:
        f.write(response.content)

    return filepath
