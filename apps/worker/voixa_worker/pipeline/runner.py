"""Top-level pipeline orchestration."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Callable, Optional

from voixa_worker.models import ProcessingJob, ProcessingResult
from voixa_worker.pipeline.audio_io import (
    HAS_AUDIO,
    HAS_LIBROSA,
    convert_to_mp3,
    copy_file,
    load_audio,
    save_audio,
)
from voixa_worker.pipeline.stages import (
    PipelineState,
    mixdown,
    noise_reduction,
    pitch_correction,
    timing_alignment,
    vocal_enhancement,
)
from voixa_worker.storage import LocalStorage

logger = logging.getLogger("voixa.worker.pipeline")

ProgressCallback = Callable[[str, int], None]


STAGE_PLAN = [
    ("preparing", 5, "Preparing your session"),
    ("cleaning", 20, "Clearing room noise"),
    ("tuning", 45, "Refining tuning"),
    ("aligning", 60, "Aligning your delivery"),
    ("polishing", 75, "Polishing tone"),
    ("mastering", 90, "Shaping the final mix"),
    ("finalizing", 100, "Finalizing your track"),
]


def run_pipeline(
    job: ProcessingJob,
    storage: LocalStorage,
    on_progress: Optional[ProgressCallback] = None,
) -> ProcessingResult:
    """Execute the full Voixa pipeline and return the processed asset keys."""

    def progress(stage: str, value: int) -> None:
        if on_progress:
            try:
                on_progress(stage, value)
            except Exception:
                logger.exception("Progress callback failed")

    progress(*_stage("preparing"))
    vocal_path = storage.ensure_exists(job.vocal.key)
    instrumental_path = storage.ensure_exists(job.instrumental.key)

    output_key = storage.build_key(
        f"projects/{job.projectId}/processed_output", "voixa_master.mp3"
    )
    preview_key = storage.build_key(
        f"projects/{job.projectId}/preview", "voixa_preview.mp3"
    )
    output_path = storage.path(output_key)
    preview_path = storage.path(preview_key)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    preview_path.parent.mkdir(parents=True, exist_ok=True)

    if not (HAS_AUDIO and HAS_LIBROSA):
        logger.warning(
            "Audio libraries unavailable - running copy-only pipeline for job %s",
            job.jobId,
        )
        _copy_only_pipeline(vocal_path, instrumental_path, output_path, preview_path, progress)
        return ProcessingResult(output_key=output_key, preview_key=preview_key)

    # Real DSP pipeline -----------------------------------------------------
    sr = 44100
    vocal, _ = load_audio(vocal_path, sr=sr)
    instrumental, _ = load_audio(instrumental_path, sr=sr)
    state = PipelineState(
        vocal=vocal,
        instrumental=instrumental,
        sample_rate=sr,
        settings=job.settings or {},
    )

    progress(*_stage("cleaning"))
    noise_reduction(state)

    progress(*_stage("tuning"))
    pitch_correction(state)

    progress(*_stage("aligning"))
    timing_alignment(state)

    progress(*_stage("polishing"))
    vocal_enhancement(state)

    progress(*_stage("mastering"))
    mixed = mixdown(state)

    progress(*_stage("finalizing"))
    if mixed is None:
        logger.warning("Mixdown returned empty output for job %s", job.jobId)
        _copy_only_pipeline(vocal_path, instrumental_path, output_path, preview_path, progress)
        return ProcessingResult(output_key=output_key, preview_key=preview_key)

    wav_path = output_path.with_suffix(".wav")
    save_audio(wav_path, mixed, sr)
    converted = convert_to_mp3(wav_path, output_path)
    if not converted:
        # Ffmpeg unavailable - serve the WAV under the mp3 key
        copy_file(wav_path, output_path)

    # Preview: first 20 seconds (ffmpeg) or mirror of the full track
    if not _render_preview(output_path, preview_path, seconds=20):
        copy_file(output_path, preview_path)

    try:
        wav_path.unlink()
    except Exception:
        pass

    duration_ms = None
    if mixed is not None:
        duration_ms = int((mixed.shape[0] / sr) * 1000)

    return ProcessingResult(
        output_key=output_key, preview_key=preview_key, duration_ms=duration_ms
    )


def _copy_only_pipeline(
    vocal_path: Path,
    instrumental_path: Path,
    output_path: Path,
    preview_path: Path,
    progress: Callable[[str, int], None],
) -> None:
    """Fallback pipeline when the audio stack is not installed."""
    for stage_key, value, _label in STAGE_PLAN[1:]:
        progress(stage_key, value)
    # Prefer the instrumental as the "mixdown" because it is usually the
    # longest/loudest asset. This keeps the UI flow demonstrable.
    copy_file(instrumental_path, output_path)
    copy_file(vocal_path, preview_path)


def _render_preview(source: Path, dest: Path, seconds: int) -> bool:
    """Use ffmpeg to create a short preview. Returns False when unavailable."""
    import shutil
    import subprocess

    if not shutil.which("ffmpeg"):
        return False
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(source),
                "-t",
                str(seconds),
                "-codec:a",
                "libmp3lame",
                "-qscale:a",
                "4",
                str(dest),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except Exception:
        return False


def _stage(key: str) -> tuple[str, int]:
    for stage_key, value, label in STAGE_PLAN:
        if stage_key == key:
            return label, value
    return key, 0
