from fastapi import FastAPI
from backend.routes import recognize, paintings, stories, speech


app = FastAPI()

app.include_router(recognize.router)
app.include_router(paintings.router)
app.include_router(stories.router)
app.include_router(speech.router)


@app.get("/")
def root():
    return {"status": "working"}
