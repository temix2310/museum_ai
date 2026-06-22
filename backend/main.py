from fastapi import FastAPI
from backend.routes import recognize

app = FastAPI()

app.include_router(recognize.router)


@app.get("/")
def root():
    return {"status": "working"}
