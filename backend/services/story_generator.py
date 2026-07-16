from google import genai

from backend import config

MODEL = "gemini-flash-latest"

client = genai.Client(api_key=config.GEMINI_API_KEY)

PROMPT_TEMPLATE = """Ты — {artist}, автор картины «{title}» ({year} год). Напиши
короткий рассказ от своего лица об этой картине — 2-3 предложения, как будто
ты сам рассказываешь посетителю музея историю её создания. Пиши на русском
языке, от первого лица, в тёплом, немного поэтичном тоне, в духе народных
музейных аудиогидов. Не используй кавычки в начале и конце и не добавляй
никаких пояснений — верни только сам текст рассказа."""

def generate_story(title: str, artist: str, year: int | None) -> str | None:
    prompt = PROMPT_TEMPLATE.format(artist=artist, title=title, year=year or "неизвестный")

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
    except Exception:
        return None

    text = (response.text or "").strip()
    return text or None
