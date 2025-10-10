"""Loader for schools table"""
from scripts.etl.loaders.supabase_loader import SupabaseUpsertLoader

class SchoolLoader(SupabaseUpsertLoader):
    """Load schools with upsert on school_id"""

    def __init__(self, batch_size: int = 500):
        super().__init__(
            table_name="schools",
            conflict_columns=["school_id"],
            batch_size=batch_size
        )
