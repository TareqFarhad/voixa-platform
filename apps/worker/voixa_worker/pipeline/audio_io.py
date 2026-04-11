"""Audio input/output helpers with graceful degradation.

The worker prefers the librosa + soundfile + numpy stack for DSP but will
still run when those libraries are not installed: in that case every stage
falls back to a pass-through copy so the API/web integration can still be
exercised end to end on a clean machine.
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import Optional, Tuple

try:
    import numpy as np  # type: ignore
    import soundfile as sf  # type: ignore

    HAS_AUDIO = True
except Exception:  # pragma: no cover - optional dependency
    np = None  # type: ignore
    sf = None  # type: ignore
    HAS_AUDIO = False

try:
    import librosa  # type: ignore

    HAS_LIBROSA = True
except Exception:  # pragma: no cover - optional dependency
    librosa = None  # type: ignore
    HAS_LIBROSA = False


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def load_audio(path: Path, sr: int = 44100) -> Tuple[Optional["np.ndarray"], int]:
    """Load an audio file as float32 mono at the target sample rate.

    Returns ``(None, sr)`` if the required audio libraries are unavailable
    so the caller can fall back to a copy-only pipeline.
    """
    if not HAS_AUDIO or not HAS_LIBROSA:
        return None, sr
    data, rate = librosa.load(str(path), sr=sr, mono=True)
    return data.astype("float32"), int(rate)


def save_audio(path: Path, data: "np.ndarray", sr: int) -> None:
    if not HAS_AUDIO:
        raise RuntimeError("Audio libraries are required to save samples")
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), data, sr, subtype="PCM_16")


def convert_to_mp3(wav_path: Path, mp3_path: Path) -> bool:
    """Convert a WAV file to MP3 using ffmpeg if available."""
    if not ffmpeg_available():
        return False
    mp3_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(wav_path),
                "-codec:a",
                "libmp3lame",
                "-qscale:a",
                "2",
                str(mp3_path),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except Exception:
        return False


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
