# Getting Started

Create python environment and install dependencies from `requirements.txt`.

Make sure postgres db is running. Run `docker compose up -d db` to start it.

Start dev server using the fastapi cli:

```sh
fastapi dev app/main.py
```

Admin interface available at `/admin`.

