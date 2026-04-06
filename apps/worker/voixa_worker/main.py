from voixa_worker.config import load_config


def main() -> None:
    config = load_config()
    print(
        {
            "status": "ok",
            "service": "worker",
            "redis": config.redis_url,
            "callback": config.api_callback_url,
        }
    )


if __name__ == "__main__":
    main()
