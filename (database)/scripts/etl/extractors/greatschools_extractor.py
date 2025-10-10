"""GreatSchools API extractor for school data"""
import requests
from typing import List, Dict, Any, Optional
from scripts.utils.base_extractor import BaseExtractor
from config.settings import settings
from loguru import logger
import time

class GreatSchoolsExtractor(BaseExtractor):
    """Extract school data from GreatSchools API"""

    BASE_URL = "https://api.greatschools.org/schools"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(source_name="GreatSchools API")
        self.api_key = api_key or settings.greatschools_api_key
        if not self.api_key:
            raise ValueError("GreatSchools API key is required")

    def get_schools_nearby(
        self,
        lat: float,
        lng: float,
        radius_miles: int = 5,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get schools near a location"""
        endpoint = f"{self.BASE_URL}/nearby"

        params = {
            "key": self.api_key,
            "lat": lat,
            "lon": lng,
            "radius": radius_miles,
            "limit": limit
        }

        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("schools", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch schools near ({lat}, {lng}): {str(e)}")
            return []

    def get_school_details(self, school_id: str, state: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a school"""
        endpoint = f"{self.BASE_URL}/{state}/{school_id}"

        params = {"key": self.api_key}

        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch school {school_id}: {str(e)}")
            return None

    def get_schools_in_city(
        self,
        city: str,
        state: str,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get all schools in a city"""
        endpoint = f"{self.BASE_URL}/{state}/{city}"

        params = {
            "key": self.api_key,
            "limit": limit
        }

        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("schools", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch schools in {city}, {state}: {str(e)}")
            return []

    def get_school_reviews(self, school_id: str, state: str) -> List[Dict[str, Any]]:
        """Get reviews for a school"""
        endpoint = f"{self.BASE_URL}/{state}/{school_id}/reviews"

        params = {
            "key": self.api_key,
            "limit": 50
        }

        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("reviews", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch reviews for school {school_id}: {str(e)}")
            return []

    def extract(self) -> List[Dict[str, Any]]:
        """
        Extract school data. Override this method based on your use case.
        This is a placeholder that demonstrates the API usage.
        """
        logger.warning("Using default extract() method. Override this for specific extraction logic.")

        # Example: Extract schools from a sample city
        sample_city = "miami"
        sample_state = "fl"

        schools = self.get_schools_in_city(sample_city, sample_state, limit=10)

        return schools


class GreatSchoolsBulkExtractor(GreatSchoolsExtractor):
    """Bulk extract schools for multiple cities"""

    def __init__(self, cities: List[Dict[str, str]], api_key: Optional[str] = None):
        """
        Initialize bulk extractor

        Args:
            cities: List of dicts with 'city' and 'state' keys
                    Example: [{"city": "miami", "state": "fl"}, ...]
        """
        super().__init__(api_key)
        self.cities = cities

    def extract(self) -> List[Dict[str, Any]]:
        """Extract schools from all specified cities"""
        all_schools = []

        for city_info in self.cities:
            city = city_info.get("city", "").lower()
            state = city_info.get("state", "").lower()

            if not city or not state:
                logger.warning(f"Skipping invalid city info: {city_info}")
                continue

            logger.info(f"Extracting schools for {city}, {state}")
            schools = self.get_schools_in_city(city, state, limit=100)

            # Add location metadata
            for school in schools:
                school["extracted_city"] = city
                school["extracted_state"] = state

            all_schools.extend(schools)

            # Rate limiting between cities
            time.sleep(1)

        return all_schools


class GreatSchoolsPropertyEnricher(GreatSchoolsExtractor):
    """Enrich properties with nearby school data"""

    def __init__(self, properties: List[Dict[str, Any]], api_key: Optional[str] = None):
        """
        Initialize property enricher

        Args:
            properties: List of properties with 'lat' and 'lng' keys
        """
        super().__init__(api_key)
        self.properties = properties

    def extract(self) -> List[Dict[str, Any]]:
        """Extract nearby schools for all properties"""
        enriched_properties = []

        for prop in self.properties:
            lat = prop.get("lat")
            lng = prop.get("lng")

            if not lat or not lng:
                logger.warning(f"Skipping property without coordinates: {prop.get('address')}")
                continue

            logger.debug(f"Finding schools near {prop.get('address')}")

            # Get nearby schools
            nearby_schools = self.get_schools_nearby(lat, lng, radius_miles=3, limit=10)

            # Add schools to property
            prop["nearby_schools"] = nearby_schools
            prop["nearby_schools_count"] = len(nearby_schools)

            # Calculate average rating
            ratings = [s.get("rating") for s in nearby_schools if s.get("rating")]
            if ratings:
                prop["avg_nearby_school_rating"] = sum(ratings) / len(ratings)

            enriched_properties.append(prop)

            # Rate limiting
            time.sleep(0.5)

        return enriched_properties
