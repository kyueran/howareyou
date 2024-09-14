from fastapi import FastAPI, Response
from app.database import engine
from app import models
from app.admin import setup_admin
from io import BytesIO
import os
import qrcode
import uvicorn

models.Base.metadata.create_all(bind=engine)
BASE_URL = os.getenv('BASE_URL', 'http://localhost:8000')

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

@app.get('/qr/{user_id}')
def generate_qr(user_id: int):
    url_template = BASE_URL + '/redirect/{user_id}'
    unique_url = url_template.format(user_id=user_id)

    img_io = BytesIO()
    qr_img = qrcode.make(unique_url)
    qr_img.save(img_io, format='PNG')
    img_io.seek(0)

    return Response(content=img_io.read(), media_type='image/png')


if __name__ == '__main':
    uvicorn.run(app, host='0.0.0.0', port=8000)

