"""Script to create the enrichment tables migration SQL file"""

migration_sql = """-- ============================================================================
-- STRIVE REAL ESTATE DATABASE - ENRICHMENT SCHEMA
-- Version: 1.0.0
-- Description: Schools, demographics, POIs, crime, environmental data
-- ============================================================================

-- ============================================================================
-- SCHOOLS
-- ============================================================================

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id TEXT UNIQUE,
    nces_id TEXT,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    geom GEOMETRY(Point, 4326),
    city_id UUID REFERENCES geographies(id),
    county_id UUID REFERENCES geographies(id),
    zip_id UUID REFERENCES geographies(id),
    school_type TEXT CHECK (school_type IN ('public', 'charter', 'private', 'magnet')),
    level TEXT CHECK (level IN ('elementary', 'middle', 'high', 'k12', 'other')),
    grades_served TEXT,
    greatschools_rating INT CHECK (greatschools_rating BETWEEN 1 AND 10),
    rating_date DATE,
    total_students INT CHECK (total_students >= 0),
    student_teacher_ratio DECIMAL(4,1),
    test_scores JSONB,
    title_1 BOOLEAN DEFAULT FALSE,
    magnet BOOLEAN DEFAULT FALSE,
    charter BOOLEAN DEFAULT FALSE,
    attendance_boundary JSONB,
    avg_parent_rating DECIMAL(2,1) CHECK (avg_parent_rating BETWEEN 1 AND 5),
    total_reviews INT DEFAULT 0,
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
    geography_id UUID NOT NULL REFERENCES geographies(id),
    geography_type TEXT NOT NULL,
    metric_date DATE NOT NULL,
    metric_period TEXT CHECK (metric_period IN ('monthly', 'quarterly', 'annual')) NOT NULL,
    homes_sold INT CHECK (homes_sold >= 0),
    total_sales_volume DECIMAL(15,2),
    median_sale_price DECIMAL(12,2),
    avg_sale_price DECIMAL(12,2),
    median_price_per_sqft DECIMAL(8,2),
    avg_price_per_sqft DECIMAL(8,2),
    median_days_on_market INT,
    avg_days_on_market DECIMAL(6,2),
    active_listings_count INT,
    new_listings_count INT,
    pending_listings_count INT,
    months_of_supply DECIMAL(4,2),
    list_to_sale_ratio DECIMAL(5,2),
    price_reductions_pct DECIMAL(5,2),
    absorption_rate DECIMAL(5,2),
    sell_through_rate DECIMAL(5,2),
    price_change_mom DECIMAL(5,2),
    price_change_yoy DECIMAL(5,2),
    volume_change_mom DECIMAL(5,2),
    volume_change_yoy DECIMAL(5,2),
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
    geography_id UUID NOT NULL REFERENCES geographies(id),
    survey_year INT NOT NULL,
    survey_type TEXT CHECK (survey_type IN ('acs_5yr', 'acs_1yr', 'census')) DEFAULT 'acs_5yr',
    total_population INT,
    population_density DECIMAL(8,2),
    population_change_5yr DECIMAL(5,2),
    median_age DECIMAL(4,1),
    age_under_18_pct DECIMAL(4,1),
    age_18_to_34_pct DECIMAL(4,1),
    age_35_to_54_pct DECIMAL(4,1),
    age_55_to_64_pct DECIMAL(4,1),
    age_65_plus_pct DECIMAL(4,1),
    median_household_income DECIMAL(10,2),
    mean_household_income DECIMAL(10,2),
    poverty_rate DECIMAL(4,1),
    high_school_grad_pct DECIMAL(4,1),
    bachelors_degree_pct DECIMAL(4,1),
    graduate_degree_pct DECIMAL(4,1),
    unemployment_rate DECIMAL(4,1),
    labor_force_participation DECIMAL(4,1),
    homeownership_rate DECIMAL(4,1),
    median_home_value DECIMAL(10,2),
    median_rent DECIMAL(7,2),
    housing_cost_burden_pct DECIMAL(4,1),
    avg_household_size DECIMAL(3,2),
    married_pct DECIMAL(4,1),
    families_with_children_pct DECIMAL(4,1),
    avg_commute_minutes DECIMAL(4,1),
    work_from_home_pct DECIMAL(4,1),
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
    geography_id UUID NOT NULL REFERENCES geographies(id),
    stat_date DATE NOT NULL,
    stat_period TEXT CHECK (stat_period IN ('monthly', 'annual')) NOT NULL,
    total_crimes INT CHECK (total_crimes >= 0),
    violent_crimes INT CHECK (violent_crimes >= 0),
    property_crimes INT CHECK (property_crimes >= 0),
    homicide INT DEFAULT 0,
    assault INT DEFAULT 0,
    robbery INT DEFAULT 0,
    burglary INT DEFAULT 0,
    theft INT DEFAULT 0,
    auto_theft INT DEFAULT 0,
    total_crime_rate DECIMAL(6,2),
    violent_crime_rate DECIMAL(6,2),
    property_crime_rate DECIMAL(6,2),
    population INT,
    yoy_change_pct DECIMAL(5,2),
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
    fema_flood_zone TEXT,
    flood_risk_score INT CHECK (flood_risk_score BETWEEN 1 AND 10),
    in_100yr_floodplain BOOLEAN DEFAULT FALSE,
    in_500yr_floodplain BOOLEAN DEFAULT FALSE,
    flood_insurance_required BOOLEAN DEFAULT FALSE,
    wildfire_risk_score INT CHECK (wildfire_risk_score BETWEEN 1 AND 10),
    fire_zone TEXT,
    earthquake_risk_score INT CHECK (earthquake_risk_score BETWEEN 1 AND 10),
    hurricane_risk_score INT CHECK (hurricane_risk_score BETWEEN 1 AND 10),
    tornado_risk_score INT CHECK (tornado_risk_score BETWEEN 1 AND 10),
    air_quality_index INT,
    noise_level_db INT,
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
    place_id TEXT UNIQUE,
    name TEXT NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    address TEXT,
    zip_id UUID REFERENCES geographies(id),
    city_id UUID REFERENCES geographies(id),
    category TEXT NOT NULL,
    subcategory TEXT,
    rating DECIMAL(2,1) CHECK (rating BETWEEN 1 AND 5),
    review_count INT DEFAULT 0,
    price_level INT CHECK (price_level BETWEEN 1 AND 4),
    phone TEXT,
    website TEXT,
    attributes JSONB,
    is_active BOOLEAN DEFAULT TRUE,
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
    permit_number TEXT NOT NULL,
    permit_type TEXT CHECK (permit_type IN (
        'new_construction', 'addition', 'renovation',
        'repair', 'demolition', 'other'
    )),
    permit_category TEXT CHECK (permit_category IN (
        'building', 'electrical', 'plumbing', 'mechanical', 'other'
    )),
    issue_date DATE,
    expiration_date DATE,
    finalized_date DATE,
    status TEXT CHECK (status IN (
        'issued', 'in_progress', 'completed', 'expired', 'cancelled'
    )),
    estimated_cost DECIMAL(10,2) CHECK (estimated_cost >= 0),
    work_description TEXT,
    contractor_name TEXT,
    address TEXT,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    zip_id UUID REFERENCES geographies(id),
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
-- PROPERTY SCORES (Calculated)
-- ============================================================================

CREATE TABLE property_scores (
    property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    investment_score INT CHECK (investment_score BETWEEN 1 AND 100),
    family_score INT CHECK (family_score BETWEEN 1 AND 100),
    commuter_score INT CHECK (commuter_score BETWEEN 1 AND 100),
    lifestyle_score INT CHECK (lifestyle_score BETWEEN 1 AND 100),
    value_score INT CHECK (value_score BETWEEN 1 AND 100),
    appreciation_potential INT CHECK (appreciation_potential BETWEEN 1 AND 100),
    walk_score INT CHECK (walk_score BETWEEN 0 AND 100),
    transit_score INT CHECK (transit_score BETWEEN 0 AND 100),
    bike_score INT CHECK (bike_score BETWEEN 0 AND 100),
    investment_score_breakdown JSONB,
    family_score_breakdown JSONB,
    estimated_rental_income DECIMAL(8,2),
    estimated_cap_rate DECIMAL(5,2),
    price_per_sqft_vs_market DECIMAL(5,2),
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
"""

# Write to migration file
with open('supabase/migrations/20251009232558_enrichment_tables.sql', 'w') as f:
    f.write(migration_sql)

print("Enrichment tables migration created successfully!")
