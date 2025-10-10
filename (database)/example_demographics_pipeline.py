"""
Example ETL Pipeline - Demographics from Census API

This demonstrates extracting and loading Census demographic data
"""

from scripts.etl.extractors.census_extractor import CensusStateExtractor
from scripts.etl.transformers.demographics_transformer import DemographicsTransformer
from scripts.etl.loaders.demographics_loader import DemographicsLoader
from config.logging_config import logger
from config.settings import settings

def main():
    """Run the demographics ETL pipeline"""

    logger.info("=" * 70)
    logger.info("STARTING ETL PIPELINE: Census Demographics")
    logger.info("=" * 70)

    # =========================================================================
    # STEP 1: EXTRACT
    # =========================================================================
    logger.info("\n[STEP 1/3] EXTRACTING demographics from Census API...")

    # Extract all counties in Florida
    FL_FIPS = "12"  # Florida state FIPS code

    extractor = CensusStateExtractor(
        state_fips=FL_FIPS,
        year=2021,
        api_key=settings.census_api_key
    )

    try:
        raw_demographics = extractor.run()
        logger.success(f"✓ Extracted demographics for {len(raw_demographics)} counties")
    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}")
        return

    if not raw_demographics:
        logger.warning("No demographics extracted. Exiting.")
        return

    # =========================================================================
    # STEP 2: TRANSFORM
    # =========================================================================
    logger.info("\n[STEP 2/3] TRANSFORMING demographics data...")

    # You would normally fetch this from the database
    # Map county names to geography UUIDs
    geography_id_map = {
        "Miami-Dade County, Florida": "uuid-for-miami-dade",
        "Orange County, Florida": "uuid-for-orange",
        "Hillsborough County, Florida": "uuid-for-hillsborough",
        # Add more as needed...
    }

    transformer = DemographicsTransformer(
        geography_id_map=geography_id_map,
        survey_year=2021
    )

    try:
        transformed_demographics = transformer.run(raw_demographics)
        logger.success(f"✓ Transformed {len(transformed_demographics)} demographic records")
    except Exception as e:
        logger.error(f"Transformation failed: {str(e)}")
        return

    if not transformed_demographics:
        logger.warning("No demographics after transformation. Exiting.")
        return

    # =========================================================================
    # STEP 3: LOAD
    # =========================================================================
    logger.info("\n[STEP 3/3] LOADING demographics into Supabase...")

    loader = DemographicsLoader(batch_size=50)

    try:
        loader.run(transformed_demographics)
        logger.success(
            f"✓ Loaded {loader.records_loaded} demographic records"
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
    logger.info(f"  Extracted:   {len(raw_demographics)} counties")
    logger.info(f"  Transformed: {len(transformed_demographics)} records")
    logger.info(f"  Loaded:      {loader.records_loaded} records")
    logger.info(f"  Failed:      {loader.records_failed} records")
    logger.info("=" * 70)
    logger.success("✓ Pipeline completed successfully!")


if __name__ == "__main__":
    main()
