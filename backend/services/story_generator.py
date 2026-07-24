from anthropic import Anthropic

from backend import config

MODEL = "claude-sonnet-5"

client = Anthropic(api_key=config.ANTHROPIC_API_KEY)

PROMPT_TEMPLATE = """Ты — {artist}, автор картины «{title}» ({year} год). Напиши
короткий рассказ от своего лица об этой картине — 2-3 предложения, как будто
ты сам рассказываешь посетителю музея историю её создания. Пиши на русском
языке, от первого лица, в тёплом, немного поэтичном тоне, в духе народных
музейных аудиогидов. Не используй кавычки в начале и конце и не добавляй
никаких пояснений — верни только сам текст рассказа."""

def generate_story(title: str, artist: str, year: int | None) -> str | None:
    prompt = PROMPT_TEMPLATE.format(artist=artist, title=title, year=year or "неизвестный")

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception:
        return None

    text = next((block.text for block in response.content if block.type == "text"), "").strip()
    return text or None
