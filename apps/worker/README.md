# Voixa Worker

Python microservice responsible for the heavy lifting of the Voixa
pipeline: noise reduction, pitch correction, timing alignment, enhancement,
and the final studio-style mixdown.

## Pipeline

```
preparing → cleaning → tuning → aligning → polishing → mastering → finalizing
```

The worker consumes jobs from the Redis list `voixa.processing`, reads
assets from the shared local storage directory (same folder the API writes
to), runs the DSP stages in `voixa_worker.pipeline`, stores the processed
MP3 back into storage, and posts progress + completion callbacks to the
API's `/api/processing/callback` route.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m voixa_worker.main
```

The worker boots in "graceful degradation" mode when the optional audio
stack (numpy, soundfile, librosa, ffmpeg) is missing. In that mode the
pipeline still completes - it simply copies audio through so the
API and web app can be exercised end to end on any machine.
