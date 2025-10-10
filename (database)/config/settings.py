"""Application settings"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    supabase_url: str
    supabase_service_role_key: str
    database_url: Optional[str] = None

    # Data sources
    rentcast_api_key: Optional[str] = None
    greatschools_api_key: Optional[str] = None
    census_api_key: Optional[str] = None
    google_maps_api_key: Optional[str] = None

    # Processing
    batch_size: int = 1000
    max_workers: int = 4

    # Paths
    data_dir: str = "data"
    raw_dir: str = "data/raw"
    processed_dir: str = "data/processed"

    class Config:
        env_file = "supabase/.env"
        case_sensitive = False

settings = Settings()
