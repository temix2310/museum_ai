import os
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent / ".env")


ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
YANDEX_API_KEY = os.getenv("YANDEX_API_KEY")
YANDEX_FOLDER_ID = os.getenv("YANDEX_FOLDER_ID")


if not ANTHROPIC_API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY не найден. Скопируйте backend/.env.example в "
        "backend/.env и впишите туда свой ключ Anthropic API."
    )
