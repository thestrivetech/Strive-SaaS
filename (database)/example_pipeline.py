"""
Example ETL Pipeline - Property Data from RentCast

This demonstrates the complete Extract → Transform → Load flow
"""

from scripts.etl.extractors.rentcast_extractor import RentCastBulkExtractor
from scripts.etl.transformers.property_transformer import PropertyTransformer
from scripts.etl.loaders.property_loader import PropertyLoader
from config.logging_config import logger
from config.settings import settings

def main():
    """Run the complete ETL pipeline"""

    logger.info("=" * 70)
    logger.info("STARTING ETL PIPELINE: RentCast Properties")
    logger.info("=" * 70)

    # =========================================================================
    # STEP 1: EXTRACT
    # =========================================================================
    logger.info("\n[STEP 1/3] EXTRACTING data from RentCast API...")

    # Define cities to extract
    cities = [
        {"city": "Miami", "state": "FL"},
        {"city": "Orlando", "state": "FL"},
        {"city": "Tampa", "state": "FL"},
    ]

    # Create extractor and run
    extractor = RentCastBulkExtractor(
        cities=cities,
        api_key=settings.rentcast_api_key
    )

    try:
        raw_properties = extractor.run()
        logger.success(f"✓ Extracted {len(raw_properties)} properties")
    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}")
        return

    if not raw_properties:
        logger.warning("No properties extracted. Exiting.")
        return

    # =========================================================================
    # STEP 2: TRANSFORM
    # =========================================================================
    logger.info("\n[STEP 2/3] TRANSFORMING data...")

    # You would normally fetch this from the database
    # For this example, we'll use a mock county_id_map
    county_id_map = {
        "MIAMI-DADE": "some-uuid-for-miami-dade",
        "ORANGE": "some-uuid-for-orange",
        "HILLSBOROUGH": "some-uuid-for-hillsborough",
    }

    # Create transformer and run
    transformer = PropertyTransformer(county_id_map=county_id_map)

    try:
        transformed_properties = transformer.run(raw_properties)
        logger.success(f"✓ Transformed {len(transformed_properties)} properties")
    except Exception as e:
        logger.error(f"Transformation failed: {str(e)}")
        return

    if not transformed_properties:
        logger.warning("No properties after transformation. Exiting.")
        return

    # =========================================================================
    # STEP 3: LOAD
    # =========================================================================
    logger.info("\n[STEP 3/3] LOADING data into Supabase...")

    # Create loader and run
    loader = PropertyLoader(batch_size=100)

    try:
        loader.run(transformed_properties)
        logger.success(
            f"✓ Loaded {loader.records_loaded} properties into database"
        )
    except Exception as e:
        logger.error(f"Load failed: {str(e)}")
        return

    # =========================================================================
    # SUMMARY
    # =========================================================================
    logger.info("\n" + "=" * 70)
    logger.info("PIPELINE SUMMARY")
    logger.info("=" * 70)
    logger.info(f"  Extracted:   {len(raw_properties)} records")
    logger.info(f"  Transformed: {len(transformed_properties)} records")
    logger.info(f"  Loaded:      {loader.records_loaded} records")
    logger.info(f"  Failed:      {loader.records_failed} records")
    logger.info("=" * 70)
    logger.success("✓ Pipeline completed successfully!")


if __name__ == "__main__":
    main()
