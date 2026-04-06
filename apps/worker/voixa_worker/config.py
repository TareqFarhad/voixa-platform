from pydantic import BaseModel
from dotenv import load_dotenv
import os


class WorkerConfig(BaseModel):
    redis_url: str = "redis://localhost:6379"
    api_callback_url: str = "http://localhost:4000/api/processing/callback"


def load_config() -> WorkerConfig:
    load_dotenv()
    return WorkerConfig(
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
        api_callback_url=os.getenv("API_CALLBACK_URL", "http://localhost:4000/api/processing/callback"),
    )
