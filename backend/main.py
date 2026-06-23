from fastapi import FastAPI
from backend.routes import recognize, paintings, stories, speech, avatars, experience
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # для разработки ок, в проде сузить
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recognize.router)
app.include_router(paintings.router)
app.include_router(stories.router)
app.include_router(speech.router)
app.include_router(avatars.router)
app.include_router(experience.router)


@app.get("/")
def root():
    return {"status": "working"}
