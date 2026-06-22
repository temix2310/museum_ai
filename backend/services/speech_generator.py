from gtts import gTTS
import os

AUDIO_DIR = "backend/assets/audio"


def generate_speech(text: str, painting_id: str) -> str:
    os.makedirs(AUDIO_DIR, exist_ok=True)
    filepath = f"{AUDIO_DIR}/{painting_id}.mp3"
    tts = gTTS(text=text, lang="ru")
    tts.save(filepath)
    return filepath
