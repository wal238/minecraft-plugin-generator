"""Logging configuration."""

import logging
from logging.config import dictConfig

from app.config import settings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "httpx": {
            "level": "WARNING",
            "handlers": ["default"],
            "propagate": False,
        },
    },
    "root": {
        "level": settings.LOG_LEVEL.upper(),
        "handlers": ["default"],
    },
}

dictConfig(LOGGING_CONFIG)


def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance."""
    return logging.getLogger(name)
