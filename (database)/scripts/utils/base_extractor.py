"""Base class for all data extractors"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
from loguru import logger
import time

class BaseExtractor(ABC):
    """Base class for data extraction"""

    def __init__(self, source_name: str):
        self.source_name = source_name
        self.start_time = None
        self.records_extracted = 0

    @abstractmethod
    def extract(self) -> List[Dict[str, Any]]:
        """Extract data from source"""
        pass

    def run(self) -> List[Dict[str, Any]]:
        """Execute extraction with logging and timing"""
        logger.info(f"Starting extraction from {self.source_name}")
        self.start_time = time.time()

        try:
            data = self.extract()
            self.records_extracted = len(data)
            elapsed = time.time() - self.start_time

            logger.success(
                f"Extracted {self.records_extracted:,} records from {self.source_name} "
                f"in {elapsed:.2f}s ({self.records_extracted/elapsed:.0f} records/sec)"
            )
            return data

        except Exception as e:
            logger.error(f"Extraction failed from {self.source_name}: {str(e)}")
            raise
