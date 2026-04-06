from voixa_worker.models import ProcessingJob


def preprocess(job: ProcessingJob) -> None:
    # TODO: plug in real audio preprocessing.
    return None


def enhance(job: ProcessingJob) -> None:
    # TODO: plug in noise reduction and pitch/timbre enhancement.
    return None


def mixdown(job: ProcessingJob) -> None:
    # TODO: plug in studio-style mixing and mastering chain.
    return None
