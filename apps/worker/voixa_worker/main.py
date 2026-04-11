"""Entrypoint for the Voixa audio processing worker."""

from __future__ import annotations

import logging
import sys

from voixa_worker.config import load_config
from voixa_worker.consumer import ProcessingConsumer


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


def main() -> None:
    _configure_logging()
    config = load_config()
    logger = logging.getLogger("voixa.worker")
    logger.info(
        "Voixa worker booting (redis=%s, queue=%s, storage=%s)",
        config.redis_url,
        config.queue_name,
        config.local_storage_dir,
    )
    try:
        ProcessingConsumer(config).run_forever()
    except RuntimeError as err:
        logger.error("Worker could not start: %s", err)
        sys.exit(1)


if __name__ == "__main__":
    main()
