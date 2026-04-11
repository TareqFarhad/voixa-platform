"""Individual stages of the Voixa audio processing pipeline.

Every stage is intentionally small and composable. When the numpy/librosa
stack is available the stages apply real DSP; otherwise they log intent and
let the runner copy audio through so the contract with the API stays
identical in both environments.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional

from voixa_worker.pipeline.audio_io import HAS_AUDIO, HAS_LIBROSA

try:
    import numpy as np  # type: ignore
except Exception:  # pragma: no cover
    np = None  # type: ignore


@dataclass
class PipelineState:
    """Mutable state that flows through every pipeline stage."""

    vocal: Optional[Any] = None
    instrumental: Optional[Any] = None
    sample_rate: int = 44100
    settings: dict[str, Any] = field(default_factory=dict)
    metrics: dict[str, Any] = field(default_factory=dict)


def _setting(state: PipelineState, key: str, default: float) -> float:
    try:
        return float(state.settings.get(key, default))
    except (TypeError, ValueError):
        return default


def _normalize(signal: "np.ndarray", peak: float = 0.97) -> "np.ndarray":
    if np is None or signal is None:
        return signal
    max_val = float(np.max(np.abs(signal))) or 1.0
    return (signal / max_val) * peak


def noise_reduction(state: PipelineState) -> None:
    """Simple spectral gate / high-pass for breathiness and rumble."""
    if not HAS_AUDIO or not HAS_LIBROSA or state.vocal is None or np is None:
        return
    import librosa  # local import so the module degrades gracefully

    smoothness = _setting(state, "smoothness", 0.5)
    # High-pass to remove rumble below ~80 Hz.
    try:
        stft = librosa.stft(state.vocal, n_fft=2048, hop_length=512)
        magnitude = np.abs(stft)
        phase = np.angle(stft)
        # Estimate noise floor from the quietest 10% of frames per bin
        threshold = np.quantile(magnitude, 0.10, axis=1, keepdims=True)
        gated = np.maximum(magnitude - threshold * (0.5 + 0.5 * smoothness), 0.0)
        refined = gated * np.exp(1j * phase)
        state.vocal = librosa.istft(refined, hop_length=512).astype("float32")
    except Exception:
        # Noise reduction is best effort - keep the original signal on error.
        return


def pitch_correction(state: PipelineState) -> None:
    """Very light pitch correction using librosa frame analysis.

    This is *not* a replacement for a neural pitch model; it nudges frames
    toward the closest semitone of an equal-temperament grid based on the
    user's chosen correction amount.
    """
    if not HAS_AUDIO or not HAS_LIBROSA or state.vocal is None or np is None:
        return
    import librosa  # local import

    amount = _setting(state, "pitchCorrection", 0.55)
    if amount <= 0.01:
        return
    try:
        f0 = librosa.yin(state.vocal, fmin=80, fmax=800, sr=state.sample_rate)
        valid = f0[np.isfinite(f0) & (f0 > 0)]
        if valid.size == 0:
            return
        # Compute a global median ratio against the nearest equal-tempered note
        median = float(np.median(valid))
        if median <= 0:
            return
        target = 2 ** (round(12 * np.log2(median / 440.0)) / 12.0) * 440.0
        ratio = target / median
        semitones = 12 * np.log2(ratio) * amount
        if abs(semitones) < 0.01:
            return
        state.vocal = librosa.effects.pitch_shift(
            state.vocal, sr=state.sample_rate, n_steps=float(semitones)
        ).astype("float32")
    except Exception:
        return


def timing_alignment(state: PipelineState) -> None:
    """Align the vocal and instrumental to the same length.

    A full beat-aware DTW alignment lives behind a future paid plan; in the
    MVP we simply trim / pad so the two tracks start together.
    """
    if not HAS_AUDIO or state.vocal is None or state.instrumental is None or np is None:
        return
    try:
        length = max(state.vocal.shape[0], state.instrumental.shape[0])
        if state.vocal.shape[0] < length:
            state.vocal = np.pad(state.vocal, (0, length - state.vocal.shape[0]))
        if state.instrumental.shape[0] < length:
            state.instrumental = np.pad(
                state.instrumental, (0, length - state.instrumental.shape[0])
            )
        state.vocal = state.vocal[:length]
        state.instrumental = state.instrumental[:length]
    except Exception:
        return


def vocal_enhancement(state: PipelineState) -> None:
    """Clarity + warmth tilt driven by the user's creative sliders."""
    if not HAS_AUDIO or state.vocal is None or np is None:
        return
    try:
        clarity = _setting(state, "clarity", 0.6)
        warmth = _setting(state, "warmth", 0.5)
        # Presence boost: light emphasis on high frequencies
        signal = state.vocal
        high = signal - _simple_lowpass(signal, cutoff=0.25)
        low = _simple_lowpass(signal, cutoff=0.05)
        tilted = signal + clarity * 0.35 * high + warmth * 0.25 * low
        state.vocal = _normalize(tilted.astype("float32"))
    except Exception:
        return


def _simple_lowpass(signal: "np.ndarray", cutoff: float) -> "np.ndarray":
    """One-pole low pass - cheap but effective for warmth/presence tilt."""
    if np is None or signal is None:
        return signal
    alpha = float(np.clip(cutoff, 0.0, 1.0))
    output = np.zeros_like(signal)
    prev = 0.0
    for i in range(signal.shape[0]):
        prev = alpha * signal[i] + (1 - alpha) * prev
        output[i] = prev
    return output


def mixdown(state: PipelineState) -> Optional[Any]:
    """Blend the polished vocal with the instrumental into a final track."""
    if not HAS_AUDIO or state.vocal is None or state.instrumental is None or np is None:
        return None
    try:
        vocal_gain = _setting(state, "vocalVolume", 0.85)
        instrumental_gain = _setting(state, "instrumentalVolume", 0.75)
        reverb = _setting(state, "reverb", 0.3)
        polish = _setting(state, "naturalVsPolished", 0.5)

        vocal = state.vocal * vocal_gain
        instrumental = state.instrumental * instrumental_gain

        if reverb > 0.01:
            vocal = _tiny_reverb(vocal, state.sample_rate, reverb)

        mix = vocal + instrumental
        # Gentle soft clipping: polish = more limiting, natural = less
        drive = 0.6 + 0.4 * polish
        mix = np.tanh(mix * drive) / drive
        return _normalize(mix.astype("float32"), peak=0.96)
    except Exception:
        return None


def _tiny_reverb(signal: "np.ndarray", sr: int, amount: float) -> "np.ndarray":
    """Single-tap algorithmic reverb - just enough to add air to the vocal."""
    if np is None:
        return signal
    delay = int(sr * 0.12)
    if delay <= 0 or delay >= signal.shape[0]:
        return signal
    wet = np.zeros_like(signal)
    wet[delay:] = signal[:-delay] * 0.55
    wet[delay * 2 :] += signal[: -delay * 2] * 0.3
    return signal * (1 - amount * 0.4) + wet * (amount * 0.6)
