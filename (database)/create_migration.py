"""Script to create the core schema migration SQL file"""

migration_sql = """-- ============================================================================
-- STRIVE REAL ESTATE DATABASE - CORE SCHEMA
-- Version: 1.0.0
-- Description: Foundation tables for property data platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

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
    boundary_geojson JSONB,
    centroid_lat DECIMAL(10,7),
    centroid_lng DECIMAL(10,7),
    population INT,
    area_sqmi DECIMAL(10,2),
    timezone TEXT DEFAULT 'America/New_York',
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(geography_code, ''))
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(geography_type, geography_code)
);

CREATE INDEX idx_geographies_type ON geographies(geography_type);
CREATE INDEX idx_geographies_parent ON geographies(parent_id);
CREATE INDEX idx_geographies_code ON geographies(geography_code);
CREATE INDEX idx_geographies_search ON geographies USING gin(search_vector);
CREATE INDEX idx_geographies_coords ON geographies(centroid_lat, centroid_lng);

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
    parcel_id TEXT NOT NULL,
    address_full TEXT NOT NULL,
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    zip_id UUID REFERENCES geographies(id),
    city_id UUID REFERENCES geographies(id),
    county_id UUID REFERENCES geographies(id) NOT NULL,
    state_id UUID REFERENCES geographies(id),
    neighborhood_id UUID REFERENCES geographies(id),
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    geom GEOMETRY(Point, 4326),
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
    assessed_value DECIMAL(12,2) CHECK (assessed_value >= 0),
    tax_assessment_year INT,
    annual_tax_amount DECIMAL(10,2) CHECK (annual_tax_amount >= 0),
    tax_delinquent BOOLEAN DEFAULT FALSE,
    hoa_fee_monthly DECIMAL(8,2),
    zoning TEXT,
    land_use TEXT,
    legal_description TEXT,
    listing_status TEXT CHECK (listing_status IN (
        'active', 'pending', 'sold', 'off_market', 'unknown'
    )) DEFAULT 'off_market',
    last_sale_date DATE,
    last_sale_price DECIMAL(12,2) CHECK (last_sale_price >= 0),
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
    data_source TEXT NOT NULL,
    source_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_parcel_county UNIQUE(parcel_id, county_id),
    CONSTRAINT check_year_renovated CHECK (year_renovated IS NULL OR year_renovated >= year_built)
);

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

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    sale_date DATE NOT NULL,
    sale_price DECIMAL(12,2) NOT NULL CHECK (sale_price > 0),
    sale_price_per_sqft DECIMAL(8,2),
    buyer_name TEXT,
    buyer_type TEXT CHECK (buyer_type IN (
        'individual', 'llc', 'corporation', 'investor', 'government', 'other'
    )),
    seller_name TEXT,
    sale_type TEXT CHECK (sale_type IN (
        'arms_length', 'foreclosure', 'short_sale', 'reo',
        'estate', 'family_transfer', 'other'
    )) DEFAULT 'arms_length',
    financing_type TEXT CHECK (financing_type IN (
        'conventional', 'cash', 'fha', 'va', 'usda', 'other'
    )),
    deed_book TEXT,
    deed_page TEXT,
    recording_date DATE,
    original_list_price DECIMAL(12,2),
    final_list_price DECIMAL(12,2),
    days_on_market INT CHECK (days_on_market >= 0),
    list_date DATE,
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
    data_source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_sale_date CHECK (sale_date <= CURRENT_DATE),
    CONSTRAINT check_recording_after_sale CHECK (recording_date IS NULL OR recording_date >= sale_date),
    CONSTRAINT check_list_before_sale CHECK (list_date IS NULL OR list_date <= sale_date)
);

CREATE INDEX idx_sales_property ON sales_history(property_id);
CREATE INDEX idx_sales_date ON sales_history(sale_date DESC);
CREATE INDEX idx_sales_price ON sales_history(sale_price);
CREATE INDEX idx_sales_type ON sales_history(sale_type);
CREATE INDEX idx_sales_buyer_type ON sales_history(buyer_type) WHERE buyer_type IS NOT NULL;
CREATE INDEX idx_sales_financing ON sales_history(financing_type) WHERE financing_type IS NOT NULL;
CREATE INDEX idx_sales_created ON sales_history(created_at DESC);

-- ============================================================================
-- TIER 4: DATA SOURCES
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
    config JSONB,
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

CREATE OR REPLACE FUNCTION get_property_age(year_built INT)
RETURNS INT AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM CURRENT_DATE)::INT - year_built;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE geographies IS 'Hierarchical geography taxonomy for the entire US';
COMMENT ON TABLE properties IS 'Core property records with characteristics and ownership';
COMMENT ON TABLE sales_history IS 'Historical sales transactions for all properties';
COMMENT ON TABLE data_sources IS 'Metadata about where data comes from and refresh schedules';
COMMENT ON TABLE data_quality_logs IS 'Tracks data quality issues for monitoring and improvement';

COMMENT ON COLUMN properties.data_completeness IS 'Auto-calculated percentage of critical fields that are populated';
COMMENT ON COLUMN properties.absentee_owner IS 'Auto-calculated: TRUE if mailing address differs from property address';
COMMENT ON COLUMN sales_history.list_to_sale_ratio IS 'Auto-calculated: (sale_price / final_list_price) * 100';
"""

# Write to migration file
with open('supabase/migrations/20251009231213_initial_schema_core.sql', 'w') as f:
    f.write(migration_sql)

print("Core schema migration created successfully!")
