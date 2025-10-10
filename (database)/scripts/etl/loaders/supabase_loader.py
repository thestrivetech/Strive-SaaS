"""Generic Supabase loader"""
from typing import List, Dict, Any
from scripts.utils.base_loader import BaseLoader
from config.database import supabase
from loguru import logger

class SupabaseLoader(BaseLoader):
    """Load data into Supabase tables"""

    def __init__(self, table_name: str, batch_size: int = 1000):
        super().__init__(table_name)
        self.batch_size = batch_size

    def load(self, data: List[Dict[str, Any]]) -> None:
        """Load data into Supabase table with batching"""
        if not data:
            logger.warning(f"No data to load into {self.table_name}")
            return

        total_records = len(data)
        logger.info(f"Loading {total_records} records into {self.table_name}")

        # Process in batches
        for i in range(0, total_records, self.batch_size):
            batch = data[i:i + self.batch_size]

            try:
                response = supabase.table(self.table_name).insert(batch).execute()

                # Supabase v2 returns response.data
                loaded_count = len(response.data) if hasattr(response, 'data') else len(batch)
                self.records_loaded += loaded_count

                logger.debug(
                    f"Batch {i // self.batch_size + 1}: "
                    f"Loaded {loaded_count}/{len(batch)} records"
                )

            except Exception as e:
                logger.error(
                    f"Failed to load batch {i // self.batch_size + 1} "
                    f"into {self.table_name}: {str(e)}"
                )
                self.records_failed += len(batch)
                continue

        logger.info(
            f"Load complete: {self.records_loaded} loaded, "
            f"{self.records_failed} failed"
        )


class SupabaseUpsertLoader(BaseLoader):
    """Upsert data into Supabase (insert or update on conflict)"""

    def __init__(
        self,
        table_name: str,
        conflict_columns: List[str],
        batch_size: int = 1000
    ):
        """
        Initialize upsert loader

        Args:
            table_name: Target table name
            conflict_columns: Columns to check for conflicts (e.g., ['parcel_id', 'county_id'])
            batch_size: Number of records per batch
        """
        super().__init__(table_name)
        self.conflict_columns = conflict_columns
        self.batch_size = batch_size

    def load(self, data: List[Dict[str, Any]]) -> None:
        """Upsert data into Supabase table"""
        if not data:
            logger.warning(f"No data to upsert into {self.table_name}")
            return

        total_records = len(data)
        logger.info(f"Upserting {total_records} records into {self.table_name}")

        # Process in batches
        for i in range(0, total_records, self.batch_size):
            batch = data[i:i + self.batch_size]

            try:
                response = (
                    supabase.table(self.table_name)
                    .upsert(
                        batch,
                        on_conflict=",".join(self.conflict_columns)
                    )
                    .execute()
                )

                upserted_count = len(response.data) if hasattr(response, 'data') else len(batch)
                self.records_loaded += upserted_count

                logger.debug(
                    f"Batch {i // self.batch_size + 1}: "
                    f"Upserted {upserted_count}/{len(batch)} records"
                )

            except Exception as e:
                logger.error(
                    f"Failed to upsert batch {i // self.batch_size + 1} "
                    f"into {self.table_name}: {str(e)}"
                )
                self.records_failed += len(batch)
                continue

        logger.info(
            f"Upsert complete: {self.records_loaded} upserted, "
            f"{self.records_failed} failed"
        )
