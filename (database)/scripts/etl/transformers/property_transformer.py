"""Transformer for property data from RentCast"""
from typing import Dict, Any, List
from scripts.utils.base_transformer import BaseTransformer
from scripts.utils.geo_utils import parse_address, validate_coordinates
from loguru import logger
import uuid

class PropertyTransformer(BaseTransformer):
    """Transform RentCast property data to match our schema"""

    def __init__(self, county_id_map: Dict[str, str] = None):
        """
        Initialize transformer

        Args:
            county_id_map: Mapping of county names to UUIDs in database
        """
        super().__init__(name="Property Transformer")
        self.county_id_map = county_id_map or {}

    def transform_single(self, raw_property: Dict[str, Any]) -> Dict[str, Any]:
        """Transform a single property record"""

        # Extract address components
        address_full = raw_property.get("formattedAddress") or raw_property.get("address", "")
        address_parts = parse_address(address_full)

        # Get coordinates
        lat = raw_property.get("latitude")
        lng = raw_property.get("longitude")

        if not lat or not lng or not validate_coordinates(lat, lng):
            logger.warning(f"Invalid coordinates for {address_full}")
            return None

        # Get county_id from map or use placeholder
        county_name = raw_property.get("county", "").upper()
        county_id = self.county_id_map.get(county_name)

        if not county_id:
            logger.warning(f"No county_id found for {county_name}, skipping property")
            return None

        # Build transformed record
        transformed = {
            # Identity
            "parcel_id": raw_property.get("apn") or f"TEMP-{uuid.uuid4()}",
            "address_full": address_full,
            "address_street": address_parts.get("street"),
            "address_city": address_parts.get("city") or raw_property.get("city"),
            "address_state": address_parts.get("state") or raw_property.get("state"),
            "address_zip": address_parts.get("zip") or raw_property.get("zipCode"),

            # Geography
            "county_id": county_id,
            "lat": float(lat),
            "lng": float(lng),

            # Basic characteristics
            "property_type": self._map_property_type(raw_property.get("propertyType")),
            "bedrooms": raw_property.get("bedrooms"),
            "bathrooms": raw_property.get("bathrooms"),
            "sqft_living": raw_property.get("squareFootage"),
            "sqft_lot": raw_property.get("lotSize"),
            "year_built": raw_property.get("yearBuilt"),

            # Structure
            "stories": raw_property.get("stories"),
            "garage_spaces": raw_property.get("garageSpaces"),

            # Financial
            "assessed_value": raw_property.get("assessedValue"),
            "last_sale_price": raw_property.get("lastSalePrice"),
            "last_sale_date": raw_property.get("lastSaleDate"),

            # Source
            "data_source": "rentcast_api",
        }

        # Remove None values
        transformed = {k: v for k, v in transformed.items() if v is not None}

        return transformed

    def _map_property_type(self, api_type: str) -> str:
        """Map RentCast property type to our schema"""
        if not api_type:
            return "other"

        type_map = {
            "Single Family": "single_family",
            "Condo": "condo",
            "Townhouse": "townhouse",
            "Multi Family": "multi_family",
            "Apartment": "multi_family",
            "Commercial": "commercial",
            "Land": "land",
            "Mobile Home": "manufactured",
        }

        return type_map.get(api_type, "other")

    def transform(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform all property records"""
        transformed_records = []

        for raw_property in data:
            try:
                transformed = self.transform_single(raw_property)
                if transformed:
                    transformed_records.append(transformed)
            except Exception as e:
                logger.error(f"Failed to transform property: {str(e)}")
                continue

        return transformed_records
