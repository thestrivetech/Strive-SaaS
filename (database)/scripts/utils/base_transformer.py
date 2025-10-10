"""Base class for data transformers"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
from loguru import logger

class BaseTransformer(ABC):
    """Base class for data transformation"""

    def __init__(self, name: str):
        self.name = name
        self.records_transformed = 0
        self.records_failed = 0

    @abstractmethod
    def transform(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform data"""
        pass

    def run(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute transformation with logging"""
        logger.info(f"Starting transformation: {self.name}")

        try:
            transformed = self.transform(data)
            self.records_transformed = len(transformed)
            self.records_failed = len(data) - len(transformed)

            logger.success(
                f"Transformed {self.records_transformed:,} records "
                f"({self.records_failed} failed)"
            )
            return transformed

        except Exception as e:
            logger.error(f"Transformation failed: {str(e)}")
            raise
