# Museum AI

Бэкенд для музейного приложения. Пользователь фотографирует картину — приложение распознаёт её и возвращает историю от лица художника, аудиорассказ и фото художника.

## Как это работает

1. Пользователь отправляет фото картины на `POST /experience`
2. Сервер сравнивает фото с эталонными изображениями
3. В ответ приходят: данные о картине, рассказ от лица художника, ссылки на аудио и фото художника

## MVP

Поддерживаются две картины:
- **Mona Lisa** — Леонардо да Винчи, 1503
- **The Starry Night** — Винсент ван Гог, 1889

## Технологии

- **Python 3.12**
- **FastAPI** — веб-фреймворк
- **uvicorn** — сервер
- **Pillow + imagehash** — распознавание картин по фото
- **gTTS** — генерация аудио (Google Text-to-Speech)

## Структура проекта

```
museum_ai/
├── backend/
│   ├── main.py                  — точка входа, запуск сервера
│   ├── requirements.txt         — зависимости
│   ├── routes/
│   │   ├── recognize.py         — POST /recognize
│   │   ├── paintings.py         — GET /painting/{id}
│   │   ├── stories.py           — GET /story/{id}
│   │   ├── speech.py            — POST /speech/{id}, GET /audio/{id}
│   │   ├── avatars.py           — GET /artist/{id}
│   │   └── experience.py        — POST /experience
│   ├── services/
│   │   ├── image_matcher.py     — сравнение фото с эталонами
│   │   ├── story_generator.py   — генерация текста
│   │   └── speech_generator.py  — генерация аудио
│   ├── database/
│   │   └── paintings.json       — данные о картинах
│   └── assets/
│       ├── paintings/           — эталонные фото картин (.jpg)
│       ├── artists/             — фото художников (.jpg)
│       └── audio/               — сгенерированные аудиофайлы (.mp3)
└── venv/                        — виртуальное окружение Python
```

## Запуск

```bash
# Активировать виртуальное окружение
source venv/bin/activate

# Установить зависимости
pip install -r backend/requirements.txt

# Запустить сервер
uvicorn backend.main:app --reload
```

Сервер запустится на `http://127.0.0.1:8000`

Документация API доступна на `http://127.0.0.1:8000/docs`

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/` | Проверка что сервер работает |
| POST | `/recognize` | Распознать картину по фото |
| GET | `/painting/{id}` | Данные о картине |
| GET | `/story/{id}` | Рассказ художника |
| POST | `/speech/{id}` | Сгенерировать аудио |
| GET | `/audio/{id}` | Получить аудиофайл |
| GET | `/artist/{id}` | Фото художника |
| POST | `/experience` | Всё сразу: распознавание + история + аудио |

## Добавление новой картины

1. Добавить эталонное фото в `backend/assets/paintings/{id}.jpg`
2. Добавить фото художника в `backend/assets/artists/{artist_id}.jpg`
3. Добавить запись в `backend/database/paintings.json`
4. В `backend/services/image_matcher.py` добавить `{id}` в словарь `PAINTINGS`

## Планы (V2)

- `POST /ask` — пользователь задаёт вопрос, художник отвечает от своего лица через LLM
- Расширение базы картин
