"""Logging configuration"""
from loguru import logger
import sys
from pathlib import Path

# Create logs directory
Path("data/logs").mkdir(parents=True, exist_ok=True)

# Configure logger
logger.remove()  # Remove default handler
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> | <level>{message}</level>",
    level="INFO"
)
logger.add(
    "data/logs/etl_{time:YYYY-MM-DD}.log",
    rotation="00:00",  # New file at midnight
    retention="30 days",  # Keep logs for 30 days
    compression="zip",  # Compress old logs
    level="DEBUG"
)
