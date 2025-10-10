"""Transformer for demographics data from Census API"""
from typing import Dict, Any, List
from scripts.utils.base_transformer import BaseTransformer
from loguru import logger

class DemographicsTransformer(BaseTransformer):
    """Transform Census data to match our schema"""

    def __init__(self, geography_id_map: Dict[str, str] = None, survey_year: int = 2021):
        """
        Initialize transformer

        Args:
            geography_id_map: Mapping of geography names to UUIDs
            survey_year: Census survey year
        """
        super().__init__(name="Demographics Transformer")
        self.geography_id_map = geography_id_map or {}
        self.survey_year = survey_year

    def transform_single(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform a single demographics record"""

        # Get geography name and ID
        geo_name = raw_data.get("NAME", "")
        geography_id = self.geography_id_map.get(geo_name)

        if not geography_id:
            logger.warning(f"No geography_id found for {geo_name}, skipping")
            return None

        # Helper function to safely convert to float
        def to_float(value):
            try:
                return float(value) if value and value != "-666666666" else None
            except (ValueError, TypeError):
                return None

        def to_int(value):
            try:
                return int(value) if value and value != "-666666666" else None
            except (ValueError, TypeError):
                return None

        # Calculate derived metrics
        total_pop = to_int(raw_data.get("B01001_001E"))
        labor_force = to_int(raw_data.get("B23025_003E"))
        unemployed = to_int(raw_data.get("B23025_005E"))
        owner_occupied = to_int(raw_data.get("B25003_002E"))
        renter_occupied = to_int(raw_data.get("B25003_003E"))
        total_households = to_int(raw_data.get("B11001_001E"))
        pop_in_households = to_int(raw_data.get("B09001_001E"))
        below_poverty = to_int(raw_data.get("B17001_002E"))
        bachelors = to_int(raw_data.get("B15003_022E"))
        masters = to_int(raw_data.get("B15003_023E"))

        # Calculate percentages
        unemployment_rate = None
        if labor_force and labor_force > 0 and unemployed is not None:
            unemployment_rate = round((unemployed / labor_force) * 100, 2)

        homeownership_rate = None
        if owner_occupied is not None and renter_occupied is not None:
            total_occupied = owner_occupied + renter_occupied
            if total_occupied > 0:
                homeownership_rate = round((owner_occupied / total_occupied) * 100, 2)

        poverty_rate = None
        if total_pop and total_pop > 0 and below_poverty is not None:
            poverty_rate = round((below_poverty / total_pop) * 100, 2)

        avg_household_size = None
        if total_households and total_households > 0 and pop_in_households:
            avg_household_size = round(pop_in_households / total_households, 2)

        # Education percentages (rough approximation)
        bachelors_pct = None
        if total_pop and total_pop > 0 and bachelors is not None:
            bachelors_pct = round((bachelors / total_pop) * 100, 2)

        # Build transformed record
        transformed = {
            # Geography
            "geography_id": geography_id,

            # Survey
            "survey_year": self.survey_year,
            "survey_type": "acs_5yr",

            # Population
            "total_population": total_pop,
            "median_age": to_float(raw_data.get("B01002_001E")),

            # Income
            "median_household_income": to_float(raw_data.get("B19013_001E")),
            "mean_household_income": to_float(raw_data.get("B19025_001E")),
            "poverty_rate": poverty_rate,

            # Education
            "bachelors_degree_pct": bachelors_pct,

            # Employment
            "unemployment_rate": unemployment_rate,

            # Housing
            "homeownership_rate": homeownership_rate,
            "median_home_value": to_float(raw_data.get("B25077_001E")),
            "median_rent": to_float(raw_data.get("B25064_001E")),

            # Household
            "avg_household_size": avg_household_size,

            # Source
            "data_source": "census_api",
        }

        # Remove None values
        transformed = {k: v for k, v in transformed.items() if v is not None}

        return transformed

    def transform(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform all demographics records"""
        transformed_records = []

        for raw_record in data:
            try:
                transformed = self.transform_single(raw_record)
                if transformed:
                    transformed_records.append(transformed)
            except Exception as e:
                logger.error(f"Failed to transform demographics: {str(e)}")
                continue

        return transformed_records
