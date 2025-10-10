"""Census API extractor for demographic data"""
import requests
from typing import List, Dict, Any, Optional
from scripts.utils.base_extractor import BaseExtractor
from config.settings import settings
from loguru import logger

class CensusExtractor(BaseExtractor):
    """Extract demographic data from US Census API"""

    BASE_URL = "https://api.census.gov/data"

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(source_name="US Census API")
        self.api_key = api_key or settings.census_api_key
        if not self.api_key:
            raise ValueError("Census API key is required")

    def get_acs_5yr_data(
        self,
        year: int,
        variables: List[str],
        geography: str,
        state: str = "*",
        county: str = "*"
    ) -> List[Dict[str, Any]]:
        """
        Get American Community Survey 5-year estimates

        Args:
            year: Survey year (e.g., 2021)
            variables: List of variable codes (e.g., ['B01001_001E', 'B19013_001E'])
            geography: Geographic level ('state', 'county', 'place', 'zip code tabulation area')
            state: State FIPS code or '*' for all
            county: County FIPS code or '*' for all
        """
        endpoint = f"{self.BASE_URL}/{year}/acs/acs5"

        # Build the GET parameter
        get_vars = ",".join(["NAME"] + variables)

        params = {
            "get": get_vars,
            "key": self.api_key
        }

        # Add geography
        if geography == "county":
            params["for"] = f"county:{county}"
            params["in"] = f"state:{state}"
        elif geography == "place":
            params["for"] = f"place:*"
            params["in"] = f"state:{state}"
        elif geography == "zip code tabulation area":
            params["for"] = "zip code tabulation area:*"
        else:
            params["for"] = geography

        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            data = response.json()

            # Convert to list of dicts
            headers = data[0]
            rows = data[1:]

            result = []
            for row in rows:
                record = dict(zip(headers, row))
                result.append(record)

            return result

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch Census data: {str(e)}")
            return []

    def get_demographics_for_county(
        self,
        state_fips: str,
        county_fips: str,
        year: int = 2021
    ) -> Optional[Dict[str, Any]]:
        """Get comprehensive demographics for a county"""

        # Common demographic variables
        variables = [
            # Population
            "B01001_001E",  # Total population
            "B01002_001E",  # Median age

            # Income
            "B19013_001E",  # Median household income
            "B19025_001E",  # Aggregate household income

            # Education
            "B15003_022E",  # Bachelor's degree
            "B15003_023E",  # Master's degree
            "B15003_024E",  # Professional degree
            "B15003_025E",  # Doctorate degree

            # Employment
            "B23025_003E",  # Civilian labor force
            "B23025_005E",  # Unemployed

            # Housing
            "B25077_001E",  # Median home value
            "B25064_001E",  # Median gross rent
            "B25003_002E",  # Owner occupied
            "B25003_003E",  # Renter occupied
        ]

        data = self.get_acs_5yr_data(
            year=year,
            variables=variables,
            geography="county",
            state=state_fips,
            county=county_fips
        )

        return data[0] if data else None

    def get_demographics_for_zip(
        self,
        zip_code: str,
        year: int = 2021
    ) -> Optional[Dict[str, Any]]:
        """Get demographics for a ZIP code"""

        variables = [
            "B01001_001E",  # Total population
            "B01002_001E",  # Median age
            "B19013_001E",  # Median household income
            "B25077_001E",  # Median home value
        ]

        data = self.get_acs_5yr_data(
            year=year,
            variables=variables,
            geography="zip code tabulation area"
        )

        # Filter for specific ZIP
        for record in data:
            if record.get("zip code tabulation area") == zip_code:
                return record

        return None

    def extract(self) -> List[Dict[str, Any]]:
        """
        Extract census data. Override this method based on your use case.
        This is a placeholder that demonstrates the API usage.
        """
        logger.warning("Using default extract() method. Override this for specific extraction logic.")

        # Example: Extract demographics for Florida counties
        fl_counties = self.get_acs_5yr_data(
            year=2021,
            variables=["B01001_001E", "B19013_001E"],
            geography="county",
            state="12"  # Florida FIPS code
        )

        return fl_counties


class CensusBulkExtractor(CensusExtractor):
    """Bulk extract demographics for multiple counties"""

    def __init__(self, counties: List[Dict[str, str]], api_key: Optional[str] = None):
        """
        Initialize bulk extractor

        Args:
            counties: List of dicts with 'state_fips' and 'county_fips' keys
                     Example: [{"state_fips": "12", "county_fips": "086"}, ...]
        """
        super().__init__(api_key)
        self.counties = counties

    def extract(self) -> List[Dict[str, Any]]:
        """Extract demographics for all specified counties"""
        all_demographics = []

        for county_info in self.counties:
            state_fips = county_info.get("state_fips")
            county_fips = county_info.get("county_fips")

            if not state_fips or not county_fips:
                logger.warning(f"Skipping invalid county info: {county_info}")
                continue

            logger.info(f"Extracting demographics for county {state_fips}-{county_fips}")

            demographics = self.get_demographics_for_county(state_fips, county_fips)

            if demographics:
                all_demographics.append(demographics)

        return all_demographics


class CensusStateExtractor(CensusExtractor):
    """Extract demographics for all counties in a state"""

    def __init__(self, state_fips: str, year: int = 2021, api_key: Optional[str] = None):
        """
        Initialize state extractor

        Args:
            state_fips: State FIPS code (e.g., "12" for Florida)
            year: Census year
        """
        super().__init__(api_key)
        self.state_fips = state_fips
        self.year = year

    def extract(self) -> List[Dict[str, Any]]:
        """Extract demographics for all counties in the state"""

        logger.info(f"Extracting demographics for all counties in state {self.state_fips}")

        # Comprehensive variable list
        variables = [
            # Population
            "B01001_001E",  # Total population
            "B01002_001E",  # Median age
            "B01001_003E",  # Male under 5 years
            "B01001_027E",  # Female under 5 years

            # Income & Poverty
            "B19013_001E",  # Median household income
            "B19025_001E",  # Aggregate household income
            "B17001_002E",  # Income below poverty level

            # Education
            "B15003_022E",  # Bachelor's degree
            "B15003_023E",  # Master's degree

            # Employment
            "B23025_003E",  # Civilian labor force
            "B23025_005E",  # Unemployed

            # Housing
            "B25077_001E",  # Median home value
            "B25064_001E",  # Median gross rent
            "B25003_002E",  # Owner occupied
            "B25003_003E",  # Renter occupied

            # Household
            "B11001_001E",  # Total households
            "B09001_001E",  # Population in households
        ]

        demographics = self.get_acs_5yr_data(
            year=self.year,
            variables=variables,
            geography="county",
            state=self.state_fips,
            county="*"
        )

        return demographics
