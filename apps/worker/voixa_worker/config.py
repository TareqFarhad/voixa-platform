"""Runtime configuration for the Voixa audio processing worker."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel


class WorkerConfig(BaseModel):
    redis_url: str = "redis://localhost:6379"
    queue_name: str = "voixa.processing"
    api_callback_url: str = "http://localhost:4000/api/processing/callback"
    local_storage_dir: Path = Path("../api/.storage")
    poll_timeout: int = 5


def load_config() -> WorkerConfig:
    load_dotenv()
    storage_dir = Path(os.getenv("LOCAL_STORAGE_DIR", "../api/.storage")).expanduser()
    return WorkerConfig(
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
        queue_name=os.getenv("PROCESSING_QUEUE", "voixa.processing"),
        api_callback_url=os.getenv(
            "API_CALLBACK_URL", "http://localhost:4000/api/processing/callback"
        ),
        local_storage_dir=storage_dir.resolve(),
        poll_timeout=int(os.getenv("WORKER_POLL_TIMEOUT", "5")),
    )
