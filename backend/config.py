import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not ANTHROPIC_API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY не найден. Скопируйте backend/.env.example в "
        "backend/.env и впишите туда свой ключ Anthropic API."
    )
