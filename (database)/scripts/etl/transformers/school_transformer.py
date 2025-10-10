"""Transformer for school data from GreatSchools"""
from typing import Dict, Any, List
from scripts.utils.base_transformer import BaseTransformer
from scripts.utils.geo_utils import validate_coordinates
from loguru import logger

class SchoolTransformer(BaseTransformer):
    """Transform GreatSchools data to match our schema"""

    def __init__(self, geography_id_map: Dict[str, Dict[str, str]] = None):
        """
        Initialize transformer

        Args:
            geography_id_map: Nested mapping of geographies
                             {"city": {"Miami": "uuid"}, "county": {...}, "zip": {...}}
        """
        super().__init__(name="School Transformer")
        self.geography_id_map = geography_id_map or {}

    def transform_single(self, raw_school: Dict[str, Any]) -> Dict[str, Any]:
        """Transform a single school record"""

        # Get coordinates
        lat = raw_school.get("lat") or raw_school.get("latitude")
        lng = raw_school.get("lon") or raw_school.get("longitude")

        if not lat or not lng or not validate_coordinates(lat, lng):
            logger.warning(f"Invalid coordinates for school {raw_school.get('name')}")
            return None

        # Get geography IDs from map
        city_name = raw_school.get("city", "").upper()
        zip_code = raw_school.get("zip")

        city_id = self.geography_id_map.get("city", {}).get(city_name)
        zip_id = self.geography_id_map.get("zip", {}).get(zip_code)

        # Build transformed record
        transformed = {
            # Identity
            "school_id": raw_school.get("id") or raw_school.get("gsId"),
            "nces_id": raw_school.get("ncesId"),
            "name": raw_school.get("name"),

            # Location
            "address": raw_school.get("address"),
            "city": raw_school.get("city"),
            "state": raw_school.get("state"),
            "zip": raw_school.get("zip"),
            "lat": float(lat),
            "lng": float(lng),

            # Geography linkage
            "city_id": city_id,
            "zip_id": zip_id,

            # Type
            "school_type": self._map_school_type(raw_school.get("type")),
            "level": self._map_school_level(raw_school.get("level")),
            "grades_served": raw_school.get("grades"),

            # Ratings
            "greatschools_rating": raw_school.get("rating"),

            # Statistics
            "total_students": raw_school.get("enrollment") or raw_school.get("students"),
            "student_teacher_ratio": raw_school.get("studentTeacherRatio"),

            # Characteristics
            "title_1": raw_school.get("titleI") == "Yes",
            "magnet": raw_school.get("isMagnet") or False,
            "charter": raw_school.get("isCharter") or False,

            # Reviews
            "avg_parent_rating": raw_school.get("parentRating"),
            "total_reviews": raw_school.get("reviewCount") or 0,

            # Source
            "data_source": "greatschools_api",
        }

        # Remove None values
        transformed = {k: v for k, v in transformed.items() if v is not None}

        return transformed

    def _map_school_type(self, api_type: str) -> str:
        """Map GreatSchools type to our schema"""
        if not api_type:
            return None

        type_map = {
            "public": "public",
            "charter": "charter",
            "private": "private",
            "magnet": "magnet",
        }

        return type_map.get(api_type.lower())

    def _map_school_level(self, api_level: str) -> str:
        """Map GreatSchools level to our schema"""
        if not api_level:
            return "other"

        level = api_level.lower()

        if "elementary" in level or "primary" in level:
            return "elementary"
        elif "middle" in level:
            return "middle"
        elif "high" in level or "secondary" in level:
            return "high"
        elif "k-12" in level or "k12" in level:
            return "k12"
        else:
            return "other"

    def transform(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform all school records"""
        transformed_records = []

        for raw_school in data:
            try:
                transformed = self.transform_single(raw_school)
                if transformed:
                    transformed_records.append(transformed)
            except Exception as e:
                logger.error(f"Failed to transform school: {str(e)}")
                continue

        return transformed_records
