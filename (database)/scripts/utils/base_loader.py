"""Base class for data loaders"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
from loguru import logger
import time

class BaseLoader(ABC):
    """Base class for data loading"""

    def __init__(self, table_name: str):
        self.table_name = table_name
        self.records_loaded = 0
        self.records_failed = 0

    @abstractmethod
    def load(self, data: List[Dict[str, Any]]) -> None:
        """Load data into database"""
        pass

    def run(self, data: List[Dict[str, Any]]) -> None:
        """Execute loading with logging and timing"""
        logger.info(f"Starting load into {self.table_name}")
        start_time = time.time()

        try:
            self.load(data)
            elapsed = time.time() - start_time

            logger.success(
                f"Loaded {self.records_loaded:,} records into {self.table_name} "
                f"in {elapsed:.2f}s ({self.records_loaded/elapsed:.0f} records/sec)"
            )

        except Exception as e:
            logger.error(f"Load failed for {self.table_name}: {str(e)}")
            raise
