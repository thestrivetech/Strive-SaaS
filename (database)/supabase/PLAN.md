DAY 2: DATABASE SCHEMA - CORE TABLES
Step 2.1: Create Migration File Structure
bash# Create first migration
supabase migration new initial_schema_core
This creates: supabase/migrations/20250110000001_initial_schema_core.sql
Step 2.2: Implement Core Schema
Create the complete SQL file:
sql-- supabase/migrations/20250110000001_initial_schema_core.sql

-- ============================================================================
-- STRIVE REAL ESTATE DATABASE - CORE SCHEMA
-- Version: 1.0.0
-- Description: Foundation tables for property data platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For advanced indexing

-- ============================================================================
-- TIER 1: GEOGRAPHY HIERARCHY
-- ============================================================================

CREATE TABLE geographies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geography_type TEXT NOT NULL CHECK (geography_type IN (
        'country', 'state', 'county', 'city', 'zip', 'neighborhood'
    )),
    geography_code TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES geographies(id),
    
    -- Spatial data
    boundary_geojson JSONB,
    centroid_lat DECIMAL(10,7),
    centroid_lng DECIMAL(10,7),
    
    -- Metadata
    population INT,
    area_sqmi DECIMAL(10,2),
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(geography_code, ''))
    ) STORED,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(geography_type, geography_code)
);

-- Indexes for geographies
CREATE INDEX idx_geographies_type ON geographies(geography_type);
CREATE INDEX idx_geographies_parent ON geographies(parent_id);
CREATE INDEX idx_geographies_code ON geographies(geography_code);
CREATE INDEX idx_geographies_search ON geographies USING gin(search_vector);
CREATE INDEX idx_geographies_coords ON geographies(centroid_lat, centroid_lng);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_geographies_updated_at BEFORE UPDATE ON geographies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TIER 2: PROPERTIES (THE CORE)
-- ============================================================================

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    parcel_id TEXT NOT NULL,
    address_full TEXT NOT NULL,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    
    -- Geography linkage (denormalized for query performance)
    zip_id UUID REFERENCES geographies(id),
    city_id UUID REFERENCES geographies(id),
    county_id UUID REFERENCES geographies(id) NOT NULL,
    state_id UUID REFERENCES geographies(id),
    neighborhood_id UUID REFERENCES geographies(id),
    
    -- Coordinates
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    
    -- Basic characteristics
    property_type TEXT CHECK (property_type IN (
        'single_family', 'condo', 'townhouse', 'multi_family', 
        'commercial', 'land', 'manufactured', 'other'
    )),
    property_subtype TEXT,
    bedrooms INT CHECK (bedrooms >= 0),
    bathrooms DECIMAL(3,1) CHECK (bathrooms >= 0),
    sqft_living INT CHECK (sqft_living > 0),
    sqft_lot INT CHECK (sqft_lot > 0),
    year_built INT CHECK (year_built >= 1700 AND year_built <= EXTRACT(YEAR FROM CURRENT_DATE) + 2),
    year_renovated INT,
    stories DECIMAL(2,1) CHECK (stories > 0),
    
    -- Structure details
    garage_type TEXT,
    garage_spaces INT CHECK (garage_spaces >= 0),
    parking_spaces INT CHECK (parking_spaces >= 0),
    pool BOOLEAN DEFAULT FALSE,
    fireplace_count INT DEFAULT 0 CHECK (fireplace_count >= 0),
    basement BOOLEAN DEFAULT FALSE,
    basement_sqft INT,
    attic BOOLEAN DEFAULT FALSE,
    hvac_type TEXT,
    heating_type TEXT,
    cooling_type TEXT,
    roof_type TEXT,
    exterior_material TEXT,
    foundation_type TEXT,
    
    -- Ownership
    owner_name TEXT,
    owner_type TEXT CHECK (owner_type IN (
        'individual', 'llc', 'trust', 'corporation', 'government', 'other'
    )),
    owner_occupied BOOLEAN,
    owner_mailing_address TEXT,
    absentee_owner BOOLEAN GENERATED ALWAYS AS (
        CASE 
            WHEN owner_mailing_address IS NOT NULL 
            AND owner_mailing_address != address_full 
            THEN TRUE 
            ELSE FALSE 
        END
    ) STORED,
    ownership_length_months INT,
    
    -- Financial
    assessed_value DECIMAL(12,2) CHECK (assessed_value >= 0),
    tax_assessment_year INT,
    annual_tax_amount DECIMAL(10,2) CHECK (annual_tax_amount >= 0),
    tax_delinquent BOOLEAN DEFAULT FALSE,
    hoa_fee_monthly DECIMAL(8,2),
    
    -- Legal
    zoning TEXT,
    land_use TEXT,
    legal_description TEXT,
    
    -- Status
    listing_status TEXT CHECK (listing_status IN (
        'active', 'pending', 'sold', 'off_market', 'unknown'
    )) DEFAULT 'off_market',
    last_sale_date DATE,
    last_sale_price DECIMAL(12,2) CHECK (last_sale_price >= 0),
    
    -- Data quality
    data_quality_score INT CHECK (data_quality_score BETWEEN 0 AND 100),
    data_completeness DECIMAL(5,2) GENERATED ALWAYS AS (
        (
            (CASE WHEN bedrooms IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN bathrooms IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN sqft_living IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN year_built IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN assessed_value IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN owner_name IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN property_type IS NOT NULL THEN 1 ELSE 0 END)
        )::DECIMAL / 7 * 100
    ) STORED,
    last_verified_date DATE,
    
    -- Source tracking
    data_source TEXT NOT NULL,
    source_updated_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_parcel_county UNIQUE(parcel_id, county_id),
    CONSTRAINT check_year_renovated CHECK (year_renovated IS NULL OR year_renovated >= year_built)
);

-- Critical indexes for properties
CREATE INDEX idx_properties_county ON properties(county_id);
CREATE INDEX idx_properties_city ON properties(city_id);
CREATE INDEX idx_properties_zip ON properties(zip_id);
CREATE INDEX idx_properties_state ON properties(state_id);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id) WHERE neighborhood_id IS NOT NULL;
CREATE INDEX idx_properties_coords ON properties(lat, lng);
CREATE INDEX idx_properties_geom ON properties USING gist(geom);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(listing_status);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms) WHERE bedrooms IS NOT NULL;
CREATE INDEX idx_properties_price_range ON properties(assessed_value) WHERE assessed_value IS NOT NULL;
CREATE INDEX idx_properties_sqft ON properties(sqft_living) WHERE sqft_living IS NOT NULL;
CREATE INDEX idx_properties_year_built ON properties(year_built) WHERE year_built IS NOT NULL;
CREATE INDEX idx_properties_updated ON properties(updated_at DESC);
CREATE INDEX idx_properties_owner_type ON properties(owner_type) WHERE owner_type IS NOT NULL;
CREATE INDEX idx_properties_absentee ON properties(absentee_owner) WHERE absentee_owner = TRUE;
CREATE INDEX idx_properties_address_search ON properties USING gin(to_tsvector('english', address_full));

-- Trigger for properties updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set geom from lat/lng
CREATE OR REPLACE FUNCTION update_property_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
        NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_property_geom BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_property_geom();

-- ============================================================================
-- TIER 3: SALES HISTORY
-- ============================================================================

CREATE TABLE sales_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Transaction details
    sale_date DATE NOT NULL,
    sale_price DECIMAL(12,2) NOT NULL CHECK (sale_price > 0),
    sale_price_per_sqft DECIMAL(8,2),
    
    -- Parties
    buyer_name TEXT,
    buyer_type TEXT CHECK (buyer_type IN (
        'individual', 'llc', 'corporation', 'investor', 'government', 'other'
    )),
    seller_name TEXT,
    
    -- Transaction type
    sale_type TEXT CHECK (sale_type IN (
        'arms_length', 'foreclosure', 'short_sale', 'reo', 
        'estate', 'family_transfer', 'other'
    )) DEFAULT 'arms_length',
    financing_type TEXT CHECK (financing_type IN (
        'conventional', 'cash', 'fha', 'va', 'usda', 'other'
    )),
    
    -- Recording info
    deed_book TEXT,
    deed_page TEXT,
    recording_date DATE,
    
    -- Listing context (if available)
    original_list_price DECIMAL(12,2),
    final_list_price DECIMAL(12,2),
    days_on_market INT CHECK (days_on_market >= 0),
    list_date DATE,
    
    -- Calculated fields
    price_change_pct DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN original_list_price IS NOT NULL AND original_list_price > 0
            THEN ((final_list_price - original_list_price) / original_list_price * 100)
            ELSE NULL
        END
    ) STORED,
    list_to_sale_ratio DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN final_list_price IS NOT NULL AND final_list_price > 0
            THEN (sale_price / final_list_price * 100)
            ELSE NULL
        END
    ) STORED,
    
    -- Source tracking
    data_source TEXT NOT NULL,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT check_sale_date CHECK (sale_date <= CURRENT_DATE),
    CONSTRAINT check_recording_after_sale CHECK (recording_date IS NULL OR recording_date >= sale_date),
    CONSTRAINT check_list_before_sale CHECK (list_date IS NULL OR list_date <= sale_date)
);

-- Indexes for sales_history
CREATE INDEX idx_sales_property ON sales_history(property_id);
CREATE INDEX idx_sales_date ON sales_history(sale_date DESC);
CREATE INDEX idx_sales_price ON sales_history(sale_price);
CREATE INDEX idx_sales_type ON sales_history(sale_type);
CREATE INDEX idx_sales_buyer_type ON sales_history(buyer_type) WHERE buyer_type IS NOT NULL;
CREATE INDEX idx_sales_financing ON sales_history(financing_type) WHERE financing_type IS NOT NULL;
CREATE INDEX idx_sales_created ON sales_history(created_at DESC);

-- ============================================================================
-- TIER 4: DATA SOURCES (Metadata)
-- ============================================================================

CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT UNIQUE NOT NULL,
    source_type TEXT CHECK (source_type IN (
        'county_assessor', 'county_recorder', 'api', 'scraper', 'manual', 'other'
    )),
    source_url TEXT,
    geography_id UUID REFERENCES geographies(id),
    update_frequency TEXT CHECK (update_frequency IN (
        'realtime', 'hourly', 'daily', 'weekly', 'monthly', 'annual', 'one_time'
    )),
    last_successful_update TIMESTAMPTZ,
    last_attempted_update TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB, -- Store scraper configs, API keys reference, etc
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_sources_geography ON data_sources(geography_id);
CREATE INDEX idx_data_sources_active ON data_sources(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TIER 5: DATA QUALITY LOGS
-- ============================================================================

CREATE TABLE data_quality_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID,
    issue_type TEXT NOT NULL CHECK (issue_type IN (
        'missing_required', 'invalid_format', 'out_of_range', 
        'duplicate', 'inconsistent', 'other'
    )),
    issue_description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    field_name TEXT,
    invalid_value TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quality_logs_table ON data_quality_logs(table_name);
CREATE INDEX idx_quality_logs_unresolved ON data_quality_logs(resolved) WHERE resolved = FALSE;
CREATE INDEX idx_quality_logs_severity ON data_quality_logs(severity);
CREATE INDEX idx_quality_logs_created ON data_quality_logs(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_meters(
    lat1 DECIMAL, 
    lng1 DECIMAL, 
    lat2 DECIMAL, 
    lng2 DECIMAL
) RETURNS INT AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lng1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng2, lat2), 4326)::geography
    )::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get property age
CREATE OR REPLACE FUNCTION get_property_age(year_built INT)
RETURNS INT AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM CURRENT_DATE)::INT - year_built;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE geographies IS 'Hierarchical geography taxonomy for the entire US';
COMMENT ON TABLE properties IS 'Core property records with characteristics and ownership';
COMMENT ON TABLE sales_history IS 'Historical sales transactions for all properties';
COMMENT ON TABLE data_sources IS 'Metadata about where data comes from and refresh schedules';
COMMENT ON TABLE data_quality_logs IS 'Tracks data quality issues for monitoring and improvement';

COMMENT ON COLUMN properties.data_completeness IS 'Auto-calculated percentage of critical fields that are populated';
COMMENT ON COLUMN properties.absentee_owner IS 'Auto-calculated: TRUE if mailing address differs from property address';
COMMENT ON COLUMN sales_history.list_to_sale_ratio IS 'Auto-calculated: (sale_price / final_list_price) * 100';
Step 2.3: Run the Migration
bash# Apply migration to Supabase
supabase db push

# Verify tables were created
supabase db diff

# Or connect with psql to verify
psql $DATABASE_URL -c "\dt"

DAY 3: DATABASE SCHEMA - ENRICHMENT TABLES
Step 3.1: Create Second Migration
bashsupabase migration new enrichment_tables
Step 3.2: Implement Enrichment Schema
sql-- supabase/migrations/20250110000002_enrichment_tables.sql

-- ============================================================================
-- STRIVE REAL ESTATE DATABASE - ENRICHMENT SCHEMA
-- Version: 1.0.0
-- Description: Schools, demographics, POIs, crime, environmental data
-- ============================================================================

-- ============================================================================
-- SCHOOLS
-- ============================================================================

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    school_id TEXT UNIQUE, -- GreatSchools ID
    nces_id TEXT, -- National Center for Education Statistics
    name TEXT NOT NULL,
    
    -- Location
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    geom GEOMETRY(Point, 4326),
    
    -- Geography linkage
    city_id UUID REFERENCES geographies(id),
    county_id UUID REFERENCES geographies(id),
    zip_id UUID REFERENCES geographies(id),
    
    -- Type
    school_type TEXT CHECK (school_type IN ('public', 'charter', 'private', 'magnet')),
    level TEXT CHECK (level IN ('elementary', 'middle', 'high', 'k12', 'other')),
    grades_served TEXT, -- 'K-5', '6-8', '9-12'
    
    -- Ratings
    greatschools_rating INT CHECK (greatschools_rating BETWEEN 1 AND 10),
    rating_date DATE,
    
    -- Statistics
    total_students INT CHECK (total_students >= 0),
    student_teacher_ratio DECIMAL(4,1),
    
    -- Test scores (state-specific)
    test_scores JSONB,
    
    -- Characteristics
    title_1 BOOLEAN DEFAULT FALSE,
    magnet BOOLEAN DEFAULT FALSE,
    charter BOOLEAN DEFAULT FALSE,
    
    -- Boundaries
    attendance_boundary JSONB, -- GeoJSON
    
    -- Reviews
    avg_parent_rating DECIMAL(2,1) CHECK (avg_parent_rating BETWEEN 1 AND 5),
    total_reviews INT DEFAULT 0,
    
    -- Source
    data_source TEXT NOT NULL,
    last_updated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schools_city ON schools(city_id);
CREATE INDEX idx_schools_county ON schools(county_id);
CREATE INDEX idx_schools_zip ON schools(zip_id);
CREATE INDEX idx_schools_rating ON schools(greatschools_rating) WHERE greatschools_rating IS NOT NULL;
CREATE INDEX idx_schools_geom ON schools USING gist(geom);
CREATE INDEX idx_schools_level ON schools(level);
CREATE INDEX idx_schools_type ON schools(school_type);

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bridge table: properties to schools
CREATE TABLE property_schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    school_level TEXT NOT NULL,
    distance_meters INT CHECK (distance_meters >= 0),
    is_assigned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, school_id)
);

CREATE INDEX idx_prop_schools_property ON property_schools(property_id);
CREATE INDEX idx_prop_schools_school ON property_schools(school_id);
CREATE INDEX idx_prop_schools_level ON property_schools(school_level);

-- ============================================================================
-- MARKET METRICS (Time-series)
-- ============================================================================

CREATE TABLE market_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Geography
    geography_id UUID NOT NULL REFERENCES geographies(id),
    geography_type TEXT NOT NULL,
    
    -- Time period
    metric_date DATE NOT NULL,
    metric_period TEXT CHECK (metric_period IN ('monthly', 'quarterly', 'annual')) NOT NULL,
    
    -- Sales volume
    homes_sold INT CHECK (homes_sold >= 0),
    total_sales_volume DECIMAL(15,2),
    
    -- Pricing
    median_sale_price DECIMAL(12,2),
    avg_sale_price DECIMAL(12,2),
    median_price_per_sqft DECIMAL(8,2),
    avg_price_per_sqft DECIMAL(8,2),
    
    -- Market velocity
    median_days_on_market INT,
    avg_days_on_market DECIMAL(6,2),
    
    -- Inventory
    active_listings_count INT,
    new_listings_count INT,
    pending_listings_count INT,
    months_of_supply DECIMAL(4,2),
    
    -- Pricing dynamics
    list_to_sale_ratio DECIMAL(5,2),
    price_reductions_pct DECIMAL(5,2),
    
    -- Market temperature
    absorption_rate DECIMAL(5,2),
    sell_through_rate DECIMAL(5,2),
    
    -- Trends (calculated)
    price_change_mom DECIMAL(5,2), -- month-over-month %
    price_change_yoy DECIMAL(5,2), -- year-over-year %
    volume_change_mom DECIMAL(5,2),
    volume_change_yoy DECIMAL(5,2),
    
    -- Source
    data_source TEXT,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(geography_id, metric_date, metric_period)
);

CREATE INDEX idx_metrics_geography ON market_metrics(geography_id);
CREATE INDEX idx_metrics_date ON market_metrics(metric_date DESC);
CREATE INDEX idx_metrics_period ON market_metrics(metric_period);
CREATE INDEX idx_metrics_geo_date ON market_metrics(geography_id, metric_date DESC);

-- ============================================================================
-- DEMOGRAPHICS (Census data)
-- ============================================================================

CREATE TABLE demographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Geography
    geography_id UUID NOT NULL REFERENCES geographies(id),
    
    -- Survey
    survey_year INT NOT NULL,
    survey_type TEXT CHECK (survey_type IN ('acs_5yr', 'acs_1yr', 'census')) DEFAULT 'acs_5yr',
    
    -- Population
    total_population INT,
    population_density DECIMAL(8,2),
    population_change_5yr DECIMAL(5,2),
    
    -- Age
    median_age DECIMAL(4,1),
    age_under_18_pct DECIMAL(4,1),
    age_18_to_34_pct DECIMAL(4,1),
    age_35_to_54_pct DECIMAL(4,1),
    age_55_to_64_pct DECIMAL(4,1),
    age_65_plus_pct DECIMAL(4,1),
    
    -- Income
    median_household_income DECIMAL(10,2),
    mean_household_income DECIMAL(10,2),
    poverty_rate DECIMAL(4,1),
    
    -- Education
    high_school_grad_pct DECIMAL(4,1),
    bachelors_degree_pct DECIMAL(4,1),
    graduate_degree_pct DECIMAL(4,1),
    
    -- Employment
    unemployment_rate DECIMAL(4,1),
    labor_force_participation DECIMAL(4,1),
    
    -- Housing
    homeownership_rate DECIMAL(4,1),
    median_home_value DECIMAL(10,2),
    median_rent DECIMAL(7,2),
    housing_cost_burden_pct DECIMAL(4,1),
    
    -- Household
    avg_household_size DECIMAL(3,2),
    married_pct DECIMAL(4,1),
    families_with_children_pct DECIMAL(4,1),
    
    -- Commute
    avg_commute_minutes DECIMAL(4,1),
    work_from_home_pct DECIMAL(4,1),
    
    -- Source
    data_source TEXT DEFAULT 'census_api',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(geography_id, survey_year, survey_type)
);

CREATE INDEX idx_demo_geography ON demographics(geography_id);
CREATE INDEX idx_demo_year ON demographics(survey_year DESC);
CREATE INDEX idx_demo_income ON demographics(median_household_income) WHERE median_household_income IS NOT NULL;

-- ============================================================================
-- CRIME STATISTICS
-- ============================================================================

CREATE TABLE crime_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Geography
    geography_id UUID NOT NULL REFERENCES geographies(id),
    
    -- Time period
    stat_date DATE NOT NULL,
    stat_period TEXT CHECK (stat_period IN ('monthly', 'annual')) NOT NULL,
    
    -- Crime counts
    total_crimes INT CHECK (total_crimes >= 0),
    violent_crimes INT CHECK (violent_crimes >= 0),
    property_crimes INT CHECK (property_crimes >= 0),
    
    -- Specific types
    homicide INT DEFAULT 0,
    assault INT DEFAULT 0,
    robbery INT DEFAULT 0,
    burglary INT DEFAULT 0,
    theft INT DEFAULT 0,
    auto_theft INT DEFAULT 0,
    
    -- Rates (per 1,000 residents)
    total_crime_rate DECIMAL(6,2),
    violent_crime_rate DECIMAL(6,2),
    property_crime_rate DECIMAL(6,2),
    
    -- Context
    population INT,
    
    -- Trends
    yoy_change_pct DECIMAL(5,2),
    
    -- Source
    data_source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(geography_id, stat_date, stat_period)
);

CREATE INDEX idx_crime_geography ON crime_statistics(geography_id);
CREATE INDEX idx_crime_date ON crime_statistics(stat_date DESC);
CREATE INDEX idx_crime_rate ON crime_statistics(total_crime_rate) WHERE total_crime_rate IS NOT NULL;

-- ============================================================================
-- ENVIRONMENTAL RISKS
-- ============================================================================

CREATE TABLE environmental_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Flood risk
    fema_flood_zone TEXT,
    flood_risk_score INT CHECK (flood_risk_score BETWEEN 1 AND 10),
    in_100yr_floodplain BOOLEAN DEFAULT FALSE,
    in_500yr_floodplain BOOLEAN DEFAULT FALSE,
    flood_insurance_required BOOLEAN DEFAULT FALSE,
    
    -- Fire risk
    wildfire_risk_score INT CHECK (wildfire_risk_score BETWEEN 1 AND 10),
    fire_zone TEXT,
    
    -- Other hazards
    earthquake_risk_score INT CHECK (earthquake_risk_score BETWEEN 1 AND 10),
    hurricane_risk_score INT CHECK (hurricane_risk_score BETWEEN 1 AND 10),
    tornado_risk_score INT CHECK (tornado_risk_score BETWEEN 1 AND 10),
    
    -- Environmental
    air_quality_index INT,
    noise_level_db INT,
    
    -- Source
    data_source TEXT NOT NULL,
    last_updated DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(property_id)
);

CREATE INDEX idx_env_property ON environmental_risks(property_id);
CREATE INDEX idx_env_flood ON environmental_risks(flood_risk_score) WHERE flood_risk_score IS NOT NULL;
CREATE INDEX idx_env_fire ON environmental_risks(wildfire_risk_score) WHERE wildfire_risk_score IS NOT NULL;
CREATE INDEX idx_env_floodplain ON environmental_risks(in_100yr_floodplain) WHERE in_100yr_floodplain = TRUE;

-- ============================================================================
-- POINTS OF INTEREST
-- ============================================================================

CREATE TABLE points_of_interest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    place_id TEXT UNIQUE, -- Google Place ID
    name TEXT NOT NULL,
    
    -- Location
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    address TEXT,
    
    -- Geography
    zip_id UUID REFERENCES geographies(id),
    city_id UUID REFERENCES geographies(id),
    
    -- Category
    category TEXT NOT NULL,
    subcategory TEXT,
    
    -- Details
    rating DECIMAL(2,1) CHECK (rating BETWEEN 1 AND 5),
    review_count INT DEFAULT 0,
    price_level INT CHECK (price_level BETWEEN 1 AND 4),
    phone TEXT,
    website TEXT,
    
    -- Attributes
    attributes JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Source
    data_source TEXT NOT NULL,
    last_verified DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_poi_geom ON points_of_interest USING gist(geom);
CREATE INDEX idx_poi_category ON points_of_interest(category);
CREATE INDEX idx_poi_subcategory ON points_of_interest(subcategory) WHERE subcategory IS NOT NULL;
CREATE INDEX idx_poi_rating ON points_of_interest(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_poi_zip ON points_of_interest(zip_id);
CREATE INDEX idx_poi_active ON points_of_interest(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_poi_updated_at BEFORE UPDATE ON points_of_interest
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BUILDING PERMITS
-- ============================================================================

CREATE TABLE building_permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Permit details
    permit_number TEXT NOT NULL,
    permit_type TEXT CHECK (permit_type IN (
        'new_construction', 'addition', 'renovation', 
        'repair', 'demolition', 'other'
    )),
    permit_category TEXT CHECK (permit_category IN (
        'building', 'electrical', 'plumbing', 'mechanical', 'other'
    )),
    
    -- Dates
    issue_date DATE,
    expiration_date DATE,
    finalized_date DATE,
    
    -- Status
    status TEXT CHECK (status IN (
        'issued', 'in_progress', 'completed', 'expired', 'cancelled'
    )),
    
    -- Financial
    estimated_cost DECIMAL(10,2) CHECK (estimated_cost >= 0),
    
    -- Description
    work_description TEXT,
    
    -- Contractor
    contractor_name TEXT,
    
    -- Geography (if property_id not available)
    address TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    zip_id UUID REFERENCES geographies(id),
    
    -- Source
    data_source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permits_property ON building_permits(property_id);
CREATE INDEX idx_permits_issue_date ON building_permits(issue_date DESC);
CREATE INDEX idx_permits_type ON building_permits(permit_type);
CREATE INDEX idx_permits_status ON building_permits(status);
CREATE INDEX idx_permits_zip ON building_permits(zip_id);
CREATE INDEX idx_permits_cost ON building_permits(estimated_cost) WHERE estimated_cost IS NOT NULL;

-- ============================================================================
-- CALCULATED SCORES
-- ============================================================================

CREATE TABLE property_scores (
    property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Core scores (1-100)
    investment_score INT CHECK (investment_score BETWEEN 1 AND 100),
    family_score INT CHECK (family_score BETWEEN 1 AND 100),
    commuter_score INT CHECK (commuter_score BETWEEN 1 AND 100),
    lifestyle_score INT CHECK (lifestyle_score BETWEEN 1 AND 100),
    value_score INT CHECK (value_score BETWEEN 1 AND 100),
    appreciation_potential INT CHECK (appreciation_potential BETWEEN 1 AND 100),
    
    -- Walk/Transit/Bike scores
    walk_score INT CHECK (walk_score BETWEEN 0 AND 100),
    transit_score INT CHECK (transit_score BETWEEN 0 AND 100),
    bike_score INT CHECK (bike_score BETWEEN 0 AND 100),
    
    -- Score breakdowns (for transparency)
    investment_score_breakdown JSONB,
    family_score_breakdown JSONB,
    
    -- Calculated metrics
    estimated_rental_income DECIMAL(8,2),
    estimated_cap_rate DECIMAL(5,2),
    price_per_sqft_vs_market DECIMAL(5,2),
    
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    model_version TEXT
);

CREATE INDEX idx_scores_investment ON property_scores(investment_score DESC) WHERE investment_score IS NOT NULL;
CREATE INDEX idx_scores_family ON property_scores(family_score DESC) WHERE family_score IS NOT NULL;
CREATE INDEX idx_scores_value ON property_scores(value_score DESC) WHERE value_score IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE schools IS 'K-12 schools with ratings and characteristics';
COMMENT ON TABLE market_metrics IS 'Time-series market statistics by geography';
COMMENT ON TABLE demographics IS 'Census demographic data by geography and year';
COMMENT ON TABLE crime_statistics IS 'Crime rates and counts by geography and time period';
COMMENT ON TABLE environmental_risks IS 'Environmental and climate risk data per property';
COMMENT ON TABLE points_of_interest IS 'Restaurants, parks, and other amenities';
COMMENT ON TABLE building_permits IS 'Building permit history for renovation tracking';
COMMENT ON TABLE property_scores IS 'AI-calculated property scores and metrics';
Step 3.3: Run Migration
bashsupabase db push

🔄 PHASE 2: DATA PIPELINE (DAYS 4-10)
DAY 4: ETL ARCHITECTURE SETUP
Step 4.1: Create ETL Directory Structure
bashmkdir -p scripts/etl/{extractors,transformers,loaders,validators}
mkdir -p scripts/utils
mkdir -p data/{raw,processed,logs}
mkdir -p config

# Create gitkeep files
touch data/raw/.gitkeep
touch data/processed/.gitkeep
touch data/logs/.gitkeep
Step 4.2: Create Base Configuration
python# config/database.py
"""Database connection configuration"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Supabase client (for simple operations)
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# SQLAlchemy engine (for bulk operations)
engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
python# config/logging_config.py
"""Logging configuration"""
from loguru import logger
import sys
from pathlib import Path

# Create logs directory
Path("data/logs").mkdir(parents=True, exist_ok=True)

# Configure logger
logger.remove()  # Remove default handler
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> | <level>{message}</level>",
    level="INFO"
)
logger.add(
    "data/logs/etl_{time:YYYY-MM-DD}.log",
    rotation="00:00",  # New file at midnight
    retention="30 days",  # Keep logs for 30 days
    compression="zip",  # Compress old logs
    level="DEBUG"
)
python# config/settings.py
"""Application settings"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    supabase_url: str
    supabase_service_role_key: str
    database_url: str
    
    # Data sources
    rentcast_api_key: Optional[str] = None
    greatschools_api_key: Optional[str] = None
    census_api_key: Optional[str] = None
    
    # Processing
    batch_size: int = 1000
    max_workers: int = 4
    
    # Paths
    data_dir: str = "data"
    raw_dir: str = "data/raw"
    processed_dir: str = "data/processed"
    
    class Config:
        env_file = ".env"

settings = Settings()
Step 4.3: Create Base Classes
python# scripts/utils/base_extractor.py
"""Base class for all data extractors"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
from loguru import logger
import time

class BaseExtractor(ABC):
    """Base class for data extraction"""
    
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.start_time = None
        self.records_extracted = 0
        
    @abstractmethod
    def extract(self) -> List[Dict[str, Any]]:
        """Extract data from source"""
        pass
    
    def run(self) -> List[Dict[str, Any]]:
        """Execute extraction with logging and timing"""
        logger.info(f"Starting extraction from {self.source_name}")
        self.start_time = time.time()
        
        try:
            data = self.extract()
            self.records_extracted = len(data)
            elapsed = time.time() - self.start_time
            
            logger.success(
                f"Extracted {self.records_extracted:,} records from {self.source_name} "
                f"in {elapsed:.2f}s ({self.records_extracted/elapsed:.0f} records/sec)"
            )
            return data
            
        except Exception as e:
            logger.error(f"Extraction failed from {self.source_name}: {str(e)}")
            raise
python# scripts/utils/base_transformer.py
"""Base class for data transformers"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
from loguru import logger

class BaseTransformer(ABC):
    """Base class for data transformation"""
    
    def __init__(self, name: str):
        self.name = name
        self.records_transformed = 0
        self.records_failed = 0
        
    @abstractmethod
    def transform(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform data"""
        pass
    
    def run(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute transformation with logging"""
        logger.info(f"Starting transformation: {self.name}")
        
        try:
            transformed = self.transform(data)
            self.records_transformed = len(transformed)
            self.records_failed = len(data) - len(transformed)
            
            logger.success(
                f"Transformed {self.records_transformed:,} records "
                f"({self.records_failed} failed)"
            )
            return transformed
            
        except Exception as e:
            logger.error(f"Transformation failed: {str(e)}")
            raise
python# scripts/utils/base_loader.py
"""Base class for data loaders"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List
from loguru import logger
import time

class BaseLoader(ABC):
    """Base class for data loading"""
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.records_loaded = 0
        self.records_failed = 0
        
    @abstractmethod
    def load(self, data: List[Dict[str, Any]]) -> None:
        """Load data into database"""
        pass
    
    def run(self, data: List[Dict[str, Any]]) -> None:
        """Execute loading with logging and timing"""
        logger.info(f"Starting load into {self.table_name}")
        start_time = time.time()
        
        try:
            self.load(data)
            elapsed = time.time() - start_time
            
            logger.success(
                f"Loaded {self.records_loaded:,} records into {self.table_name} "
                f"in {elapsed:.2f}s ({self.records_loaded/elapsed:.0f} records/sec)"
            )
            
        except Exception as e:
            logger.error(f"Load failed for {self.table_name}: {str(e)}")
            raise

DAY 5-6: VALIDATORS & UTILITIES
Step 5.1: Create Data Validators
python# scripts/validators/property_validator.py
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
Step 5.2: Create Utility Functions
python# scripts/utils/geo_utils.py
"""Geographic utility functions"""
import re
from typing import Optional, Tuple
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
python# scripts/utils/db_utils.py
"""Database utility functions"""
from typing import List, Dict, Any
import pandas as pd
from sqlalchemy import text
from config.database import engine
from loguru import logger

def bulk_insert(table_name: str, records: List[Dict[str, Any]], batch_size: int = 1000) -> int:
    """Bulk insert records into database"""
    if not records:
        return 0
    
    # Convert to DataFrame
    df = pd.DataFrame(records)
    
    # Insert in batches
    total_inserted = 0
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        try:
            batch.to_sql(
                table_name,
                engine,
                if_exists='append',
                index=False,
                method='multi'
            )
            total_inserted += len(batch)
            logger.debug(f"Inserted batch {i//batch_size + 1}: {len(batch)} records")
        except Exception as e:
            logger.error(f"Batch insert failed: {str(e)}")
            # Continue with next batch
            continue
    
    return total_inserted

def upsert(table_name: str, records: List[Dict[str, Any]], conflict_columns: List[str]) -> int:
    """Upsert records (insert or update on conflict)"""
    if not records:
        return 0
    
    # This is PostgreSQL-specific
    df = pd.DataFrame(records)
    columns = df.columns.tolist()
    conflict_cols = ', '.join(conflict_columns)
    update_cols = ', '.join([f"{col} = EXCLUDED.{col}" for col in columns if col not in conflict_columns])
    
    # Build SQL
    placeholders = ', '.join([f":{col}" for col in columns])
    sql = f"""
        INSERT INTO {table_name} ({', '.join(columns)})
        VALUES ({placeholders})
        ON CONFLICT ({conflict_cols})
        DO UPDATE SET {update_cols}
    """
    
    # Execute
    with engine.begin() as conn:
        result = conn.execute(text(sql), records)
        return result.rowcount

def execute_query(query: str, params: Dict = None) -> List[Dict]:
    """Execute raw SQL query"""
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        return [dict(row) for row in result]