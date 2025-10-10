"""Geographic utility functions"""
import re
from typing import Optional, Tuple, Dict
from shapely.geometry import Point
import geopandas as gpd

def parse_address(address: str) -> Dict[str, str]:
    """Parse address into components"""
    # Simple parser - can be enhanced
    parts = {
        'street': '',
        'city': '',
        'state': '',
        'zip': ''
    }

    # Extract ZIP code
    zip_match = re.search(r'\b\d{5}(?:-\d{4})?\b', address)
    if zip_match:
        parts['zip'] = zip_match.group()
        address = address.replace(parts['zip'], '').strip()

    # Extract state (2-letter code)
    state_match = re.search(r'\b[A-Z]{2}\b', address)
    if state_match:
        parts['state'] = state_match.group()
        address = address.replace(parts['state'], '').strip()

    # Remaining is street and city (simplified)
    components = [c.strip() for c in address.split(',')]
    if len(components) >= 2:
        parts['street'] = components[0]
        parts['city'] = components[1]
    elif len(components) == 1:
        parts['street'] = components[0]

    return parts

def validate_coordinates(lat: float, lng: float) -> bool:
    """Validate lat/lng coordinates"""
    return -90 <= lat <= 90 and -180 <= lng <= 180

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in meters between two points"""
    point1 = Point(lng1, lat1)
    point2 = Point(lng2, lat2)

    # Create GeoDataFrame for accurate distance calculation
    gdf1 = gpd.GeoDataFrame([1], geometry=[point1], crs="EPSG:4326")
    gdf2 = gpd.GeoDataFrame([1], geometry=[point2], crs="EPSG:4326")

    # Convert to meters (UTM)
    gdf1_utm = gdf1.to_crs("EPSG:3857")
    gdf2_utm = gdf2.to_crs("EPSG:3857")

    distance = gdf1_utm.geometry[0].distance(gdf2_utm.geometry[0])
    return round(distance, 2)
