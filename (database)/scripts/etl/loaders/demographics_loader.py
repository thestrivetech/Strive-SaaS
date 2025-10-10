"""Loader for demographics table"""
from scripts.etl.loaders.supabase_loader import SupabaseUpsertLoader

class DemographicsLoader(SupabaseUpsertLoader):
    """Load demographics with upsert on geography_id + survey_year"""

    def __init__(self, batch_size: int = 500):
        super().__init__(
            table_name="demographics",
            conflict_columns=["geography_id", "survey_year", "survey_type"],
            batch_size=batch_size
        )
