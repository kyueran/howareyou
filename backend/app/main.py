from fastapi import FastAPI
from app.database import engine
from app import models
from app.admin import setup_admin

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    await setup_admin(app)

@app.get("/healthcheck")
def healthcheck():
    return {"message": "Server is running!"}

@app.get("/user/{user_id}")
def read_item(user_id: int, q: str = None):
    return {"message": f'user id of {user_id} received', "q": q}
