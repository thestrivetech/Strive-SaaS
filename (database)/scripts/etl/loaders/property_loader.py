"""Loader for properties table"""
from typing import List, Dict, Any
from scripts.etl.loaders.supabase_loader import SupabaseUpsertLoader
from scripts.etl.validators.property_validator import validate_property_batch
from loguru import logger

class PropertyLoader(SupabaseUpsertLoader):
    """Load properties with validation"""

    def __init__(self, batch_size: int = 500):
        # Upsert on conflict with parcel_id + county_id
        super().__init__(
            table_name="properties",
            conflict_columns=["parcel_id", "county_id"],
            batch_size=batch_size
        )

    def load(self, data: List[Dict[str, Any]]) -> None:
        """Load properties with validation"""

        # Validate data first
        logger.info("Validating property records...")
        valid_records, invalid_records = validate_property_batch(data)

        if invalid_records:
            logger.warning(
                f"Found {len(invalid_records)} invalid records. "
                f"These will not be loaded."
            )

        if not valid_records:
            logger.error("No valid records to load!")
            return

        # Convert Pydantic models to dicts
        property_dicts = [record.dict() for record in valid_records]

        # Load using parent class
        super().load(property_dicts)

        logger.info(
            f"Property load summary: "
            f"{self.records_loaded} loaded, "
            f"{len(invalid_records)} invalid"
        )
