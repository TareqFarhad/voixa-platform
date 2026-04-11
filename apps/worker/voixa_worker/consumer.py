"""Redis consumer that drives the Voixa processing pipeline."""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

import requests

try:
    import redis  # type: ignore
except Exception:  # pragma: no cover
    redis = None  # type: ignore

from voixa_worker.config import WorkerConfig
from voixa_worker.models import ProcessingJob
from voixa_worker.pipeline import run_pipeline
from voixa_worker.storage import LocalStorage

logger = logging.getLogger("voixa.worker.consumer")


class ProcessingConsumer:
    def __init__(self, config: WorkerConfig) -> None:
        self.config = config
        self.storage = LocalStorage(config.local_storage_dir)
        self._client: Optional[Any] = None

    def _connect(self) -> Any:
        if redis is None:
            raise RuntimeError("The 'redis' package is required to consume jobs")
        if self._client is None:
            self._client = redis.from_url(self.config.redis_url, decode_responses=True)
        return self._client

    def run_forever(self) -> None:
        logger.info(
            "Voixa worker online - queue=%s redis=%s storage=%s",
            self.config.queue_name,
            self.config.redis_url,
            self.config.local_storage_dir,
        )
        client = self._connect()
        while True:
            try:
                result = client.blpop(self.config.queue_name, timeout=self.config.poll_timeout)
                if not result:
                    continue
                _, raw = result
                payload = json.loads(raw)
                self.handle(payload)
            except KeyboardInterrupt:
                logger.info("Worker stopping - keyboard interrupt")
                return
            except Exception:
                logger.exception("Worker loop failure - continuing")

    def handle(self, payload: dict[str, Any]) -> None:
        try:
            job = ProcessingJob.model_validate(payload)
        except Exception:
            logger.exception("Rejected malformed job payload: %s", payload)
            return

        logger.info("Starting job %s for project %s", job.jobId, job.projectId)
        self._callback(job, status="RUNNING", stage="Preparing your session", progress=5)

        try:
            result = run_pipeline(
                job,
                self.storage,
                on_progress=lambda stage, value: self._callback(
                    job, status="RUNNING", stage=stage, progress=value
                ),
            )
        except FileNotFoundError as err:
            logger.error("Missing asset for job %s: %s", job.jobId, err)
            self._callback(
                job,
                status="FAILED",
                stage="failed",
                progress=100,
                error=f"Missing input asset: {err}",
            )
            return
        except Exception as err:  # pragma: no cover - defensive
            logger.exception("Pipeline failed for job %s", job.jobId)
            self._callback(
                job,
                status="FAILED",
                stage="failed",
                progress=100,
                error=f"Unexpected processing error: {err}",
            )
            return

        self._callback(
            job,
            status="COMPLETED",
            stage="Your track is ready",
            progress=100,
            output_key=result.output_key,
            preview_key=result.preview_key,
        )
        logger.info(
            "Job %s finished - output=%s preview=%s",
            job.jobId,
            result.output_key,
            result.preview_key,
        )

    def _callback(
        self,
        job: ProcessingJob,
        *,
        status: str,
        stage: str,
        progress: int,
        output_key: Optional[str] = None,
        preview_key: Optional[str] = None,
        error: Optional[str] = None,
    ) -> None:
        body: dict[str, Any] = {
            "jobId": job.jobId,
            "status": status,
            "stage": stage,
            "progress": progress,
        }
        if output_key:
            body["outputKey"] = output_key
        if preview_key:
            body["previewKey"] = preview_key
        if error:
            body["errorMessage"] = error
        try:
            requests.post(job.callbackUrl, json=body, timeout=10)
        except Exception:
            logger.warning("Failed to post callback for job %s", job.jobId)
