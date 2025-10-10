"""Validators for property data"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, validator, Field
from datetime import datetime

class PropertyRecord(BaseModel):
    """Pydantic model for property validation"""

    # Required fields
    parcel_id: str
    address_full: str
    county_id: str  # UUID as string
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    data_source: str

    # Optional but validated fields
    bedrooms: Optional[int] = Field(None, ge=0, le=50)
    bathrooms: Optional[float] = Field(None, ge=0, le=20)
    sqft_living: Optional[int] = Field(None, gt=0, le=1000000)
    sqft_lot: Optional[int] = Field(None, gt=0, le=1000000000)
    year_built: Optional[int] = Field(None, ge=1700, le=datetime.now().year + 2)
    assessed_value: Optional[float] = Field(None, ge=0)

    @validator('address_full')
    def validate_address(cls, v):
        if len(v) < 5:
            raise ValueError("Address too short")
        return v.strip().title()

    @validator('parcel_id')
    def validate_parcel(cls, v):
        if not v or len(v) < 3:
            raise ValueError("Invalid parcel ID")
        return v.strip()

    class Config:
        # Allow extra fields (will be filtered out)
        extra = 'ignore'

def validate_property_record(record: Dict[str, Any]) -> Optional[PropertyRecord]:
    """Validate a single property record"""
    try:
        return PropertyRecord(**record)
    except Exception as e:
        from loguru import logger
        logger.warning(f"Validation failed for parcel {record.get('parcel_id')}: {str(e)}")
        return None

def validate_property_batch(records: List[Dict[str, Any]]) -> tuple[List[PropertyRecord], List[Dict]]:
    """Validate a batch of property records"""
    valid = []
    invalid = []

    for record in records:
        validated = validate_property_record(record)
        if validated:
            valid.append(validated)
        else:
            invalid.append(record)

    return valid, invalid
