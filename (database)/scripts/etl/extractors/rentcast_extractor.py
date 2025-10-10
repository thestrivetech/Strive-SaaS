"""RentCast API extractor for property data"""
import requests
from typing import List, Dict, Any, Optional
from scripts.utils.base_extractor import BaseExtractor
from config.settings import settings
from loguru import logger
import time

class RentCastExtractor(BaseExtractor):
    """Extract property data from RentCast API"""

    BASE_URL = "https://api.rentcast.io/v1"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(source_name="RentCast API")
        self.api_key = api_key or settings.rentcast_api_key
        if not self.api_key:
            raise ValueError("RentCast API key is required")

        self.headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json"
        }

    def get_property_by_address(self, address: str) -> Optional[Dict[str, Any]]:
        """Get property details by address"""
        endpoint = f"{self.BASE_URL}/properties"
        params = {"address": address}

        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch property at {address}: {str(e)}")
            return None

    def get_properties_in_city(self, city: str, state: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get properties in a city"""
        endpoint = f"{self.BASE_URL}/properties/search"

        properties = []
        offset = 0

        while len(properties) < limit:
            params = {
                "city": city,
                "state": state,
                "limit": min(50, limit - len(properties)),  # API limit per request
                "offset": offset
            }

            try:
                response = requests.get(endpoint, headers=self.headers, params=params)
                response.raise_for_status()
                data = response.json()

                batch = data.get("properties", [])
                if not batch:
                    break

                properties.extend(batch)
                offset += len(batch)

                logger.debug(f"Retrieved {len(properties)}/{limit} properties for {city}, {state}")

                # Rate limiting
                time.sleep(0.2)

            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to fetch properties for {city}, {state}: {str(e)}")
                break

        return properties

    def get_property_value(self, address: str) -> Optional[Dict[str, Any]]:
        """Get property valuation"""
        endpoint = f"{self.BASE_URL}/avm/value"
        params = {"address": address}

        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch valuation for {address}: {str(e)}")
            return None

    def get_rent_estimate(self, address: str) -> Optional[Dict[str, Any]]:
        """Get rental income estimate"""
        endpoint = f"{self.BASE_URL}/avm/rent"
        params = {"address": address}

        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch rent estimate for {address}: {str(e)}")
            return None

    def extract(self) -> List[Dict[str, Any]]:
        """
        Extract property data. Override this method based on your use case.
        This is a placeholder that demonstrates the API usage.
        """
        logger.warning("Using default extract() method. Override this for specific extraction logic.")

        # Example: Extract properties from a sample city
        sample_city = "Miami"
        sample_state = "FL"

        properties = self.get_properties_in_city(sample_city, sample_state, limit=10)

        return properties


class RentCastBulkExtractor(RentCastExtractor):
    """Bulk extract properties for multiple cities"""

    def __init__(self, cities: List[Dict[str, str]], api_key: Optional[str] = None):
        """
        Initialize bulk extractor

        Args:
            cities: List of dicts with 'city' and 'state' keys
                    Example: [{"city": "Miami", "state": "FL"}, ...]
        """
        super().__init__(api_key)
        self.cities = cities

    def extract(self) -> List[Dict[str, Any]]:
        """Extract properties from all specified cities"""
        all_properties = []

        for city_info in self.cities:
            city = city_info.get("city")
            state = city_info.get("state")

            if not city or not state:
                logger.warning(f"Skipping invalid city info: {city_info}")
                continue

            logger.info(f"Extracting properties for {city}, {state}")
            properties = self.get_properties_in_city(city, state, limit=100)

            # Add location metadata
            for prop in properties:
                prop["extracted_city"] = city
                prop["extracted_state"] = state

            all_properties.extend(properties)

            # Rate limiting between cities
            time.sleep(1)

        return all_properties


class RentCastEnrichmentExtractor(RentCastExtractor):
    """Enrich existing properties with RentCast data"""

    def __init__(self, addresses: List[str], api_key: Optional[str] = None):
        """
        Initialize enrichment extractor

        Args:
            addresses: List of full addresses to enrich
        """
        super().__init__(api_key)
        self.addresses = addresses

    def extract(self) -> List[Dict[str, Any]]:
        """Extract enrichment data for all addresses"""
        enriched_data = []

        for address in self.addresses:
            logger.debug(f"Enriching {address}")

            # Get property details
            property_data = self.get_property_by_address(address)
            if not property_data:
                continue

            # Get valuation
            valuation = self.get_property_value(address)
            if valuation:
                property_data["valuation"] = valuation

            # Get rent estimate
            rent_estimate = self.get_rent_estimate(address)
            if rent_estimate:
                property_data["rent_estimate"] = rent_estimate

            enriched_data.append(property_data)

            # Rate limiting
            time.sleep(0.3)

        return enriched_data
