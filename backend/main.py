from fastapi import FastAPI
from backend.routes import recognize, paintings

app = FastAPI()

app.include_router(recognize.router)
app.include_router(paintings.router)


@app.get("/")
def root():
    return {"status": "working"}
