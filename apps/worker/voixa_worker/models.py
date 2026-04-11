"""Typed contract for jobs exchanged between the API and the worker."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class AssetRef(BaseModel):
    key: str
    format: Optional[str] = None


class ProcessingJob(BaseModel):
    jobId: str
    projectId: str
    userId: str
    vocal: AssetRef
    instrumental: AssetRef
    lyrics: Optional[str] = None
    settings: dict[str, Any] = Field(default_factory=dict)
    callbackUrl: str


class ProcessingResult(BaseModel):
    output_key: str
    preview_key: Optional[str] = None
    duration_ms: Optional[int] = None
