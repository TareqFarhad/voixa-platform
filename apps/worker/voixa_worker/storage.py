"""Local filesystem storage helper used by the worker.

This mirrors the API's StorageService so the worker can read uploaded
vocals/instrumentals and write processed outputs into the same directory
tree the API serves back to the web app.
"""

from __future__ import annotations

import uuid
from pathlib import Path
from time import time


class LocalStorage:
    def __init__(self, root: Path) -> None:
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def path(self, key: str) -> Path:
        safe = key.lstrip("/")
        return self.root / safe

    def ensure_exists(self, key: str) -> Path:
        p = self.path(key)
        if not p.exists():
            raise FileNotFoundError(f"Asset not found in local storage: {key}")
        return p

    def build_key(self, prefix: str, filename: str) -> str:
        stamp = int(time() * 1000)
        token = uuid.uuid4().hex[:8]
        safe = "".join(c if c.isalnum() or c in "._-" else "_" for c in filename)
        return f"{prefix}/{stamp}-{token}-{safe}"

    def write_bytes(self, key: str, data: bytes) -> Path:
        dest = self.path(key)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return dest
