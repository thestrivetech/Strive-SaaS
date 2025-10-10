# Strive Real Estate Database

Complete database infrastructure for the Strive real estate platform with ETL pipelines and Supabase integration.

## 📁 Project Structure

```
(database)/
├── supabase/                    # Supabase CLI directory
│   ├── migrations/              # SQL migrations (15 tables)
│   ├── config.toml              # Supabase configuration
│   └── .env                     # Environment variables
├── config/                      # Python configuration
│   ├── database.py              # Supabase + SQLAlchemy setup
│   ├── logging_config.py        # Loguru logging
│   └── settings.py              # Pydantic settings
├── scripts/                     # ETL scripts
│   ├── etl/
│   │   ├── extractors/          # API extractors
│   │   │   ├── rentcast_extractor.py
│   │   │   ├── greatschools_extractor.py
│   │   │   └── census_extractor.py
│   │   ├── transformers/        # Data transformers
│   │   │   ├── property_transformer.py
│   │   │   ├── school_transformer.py
│   │   │   └── demographics_transformer.py
│   │   ├── loaders/             # Database loaders
│   │   │   ├── supabase_loader.py
│   │   │   ├── property_loader.py
│   │   │   ├── school_loader.py
│   │   │   └── demographics_loader.py
│   │   └── validators/          # Data validators
│   │       └── property_validator.py
│   └── utils/                   # Utility functions
│       ├── base_extractor.py
│       ├── base_transformer.py
│       ├── base_loader.py
│       ├── geo_utils.py
│       └── db_utils.py
├── data/                        # Data storage
│   ├── raw/                     # Raw extracted data
│   ├── processed/               # Transformed data
│   └── logs/                    # ETL logs (auto-rotating)
├── example_pipeline.py          # Example: Property pipeline
├── example_demographics_pipeline.py  # Example: Demographics pipeline
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🗄️ Database Schema

### Core Tables (5)
- **geographies** - Hierarchical geography taxonomy (states, counties, cities, ZIPs)
- **properties** - Core property records (50+ fields)
- **sales_history** - Historical sales transactions
- **data_sources** - ETL metadata tracking
- **data_quality_logs** - Data quality monitoring

### Enrichment Tables (8)
- **schools** - K-12 schools with ratings
- **market_metrics** - Time-series market statistics
- **demographics** - Census demographic data
- **crime_statistics** - Crime rates by geography
- **environmental_risks** - Flood, fire, earthquake risks
- **points_of_interest** - Restaurants, parks, amenities
- **building_permits** - Construction permits
- **property_scores** - AI-calculated scores

### Supporting Infrastructure
- **15 API Functions** - Stored procedures for efficient queries
- **7 Materialized Views** - Pre-computed analytics
- **RLS Policies** - Row-Level Security on all tables

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create `supabase/.env`:
```env
# Supabase (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# API Keys (optional - for extractors)
RENTCAST_API_KEY=your-rentcast-key
GREATSCHOOLS_API_KEY=your-greatschools-key
CENSUS_API_KEY=your-census-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 3. Start Supabase Locally

```bash
cd supabase
supabase start
```

This gives you:
- **Studio UI**: http://localhost:54323
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres
- **API**: http://localhost:54321

### 4. Apply Migrations

Migrations are automatically applied when you run `supabase start`. To reset:

```bash
supabase db reset
```

### 5. Run Example Pipeline

```bash
python example_pipeline.py
```

## 📊 Data Pipelines

### Property Pipeline (RentCast)

```python
from scripts.etl.extractors.rentcast_extractor import RentCastBulkExtractor
from scripts.etl.transformers.property_transformer import PropertyTransformer
from scripts.etl.loaders.property_loader import PropertyLoader

# Extract
cities = [{"city": "Miami", "state": "FL"}]
extractor = RentCastBulkExtractor(cities=cities)
raw_data = extractor.run()

# Transform
transformer = PropertyTransformer(county_id_map={...})
clean_data = transformer.run(raw_data)

# Load
loader = PropertyLoader()
loader.run(clean_data)
```

### Schools Pipeline (GreatSchools)

```python
from scripts.etl.extractors.greatschools_extractor import GreatSchoolsBulkExtractor
from scripts.etl.transformers.school_transformer import SchoolTransformer
from scripts.etl.loaders.school_loader import SchoolLoader

# Extract, Transform, Load...
```

### Demographics Pipeline (Census)

```python
from scripts.etl.extractors.census_extractor import CensusStateExtractor
from scripts.etl.transformers.demographics_transformer import DemographicsTransformer
from scripts.etl.loaders.demographics_loader import DemographicsLoader

# Extract, Transform, Load...
```

## 🔧 API Functions

Query the database using pre-built functions:

```sql
-- Search properties
SELECT * FROM search_properties(
    p_search_text := 'Miami',
    p_min_bedrooms := 3,
    p_max_price := 500000
);

-- Get property details with all related data
SELECT get_property_full_details('property-uuid');

-- Get neighborhood statistics
SELECT get_neighborhood_stats('geography-uuid');

-- Find investment opportunities
SELECT * FROM get_investment_opportunities(
    p_geography_id := 'geography-uuid',
    p_min_investment_score := 70
);
```

## 📈 Materialized Views

Pre-computed analytics for fast queries:

```sql
-- Geography property statistics
SELECT * FROM mv_geography_property_stats WHERE geography_id = '...';

-- Investment opportunities (pre-filtered score >= 60)
SELECT * FROM mv_investment_opportunities ORDER BY composite_investment_score DESC LIMIT 10;

-- Market health indicators
SELECT * FROM mv_market_health WHERE market_type = 'seller_market';

-- School district ratings
SELECT * FROM mv_school_district_stats ORDER BY avg_rating DESC;

-- Neighborhood summaries (combines multiple sources)
SELECT * FROM mv_neighborhood_summary WHERE city_name = 'Miami';
```

### Refresh Views

```sql
-- Refresh all views
SELECT * FROM refresh_all_materialized_views();

-- Refresh specific view
SELECT * FROM refresh_materialized_view('mv_recent_sales_activity');
```

## 🧪 Testing Locally

### 1. Access Supabase Studio

Open http://localhost:54323 in your browser

- **Table Editor**: View/edit all tables
- **SQL Editor**: Run custom queries
- **Database**: View schema, functions, policies
- **API Docs**: Auto-generated API documentation

### 2. Connect via psql

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### 3. Test API Functions

```sql
-- Test search function
SELECT * FROM search_properties(p_limit := 5);

-- Test geography hierarchy
SELECT get_geography_hierarchy('some-uuid');
```

### 4. Check Logs

Logs are automatically written to:
- Console (INFO level)
- `data/logs/etl_YYYY-MM-DD.log` (DEBUG level)

Logs rotate daily and are retained for 30 days.

## 🔐 Security (RLS Policies)

Row Level Security is enabled on all tables:

- **Public read** - Anyone can SELECT
- **Service role write** - Only service role can INSERT/UPDATE/DELETE
- **Sensitive tables** - data_sources and data_quality_logs are service role only

Policies are automatically applied via migrations.

## 📦 Requirements

### Python Packages
- supabase
- sqlalchemy
- pandas
- geopandas
- pydantic
- loguru
- requests

See `requirements.txt` for full list.

### External APIs
- **RentCast** - Property data and valuations
- **GreatSchools** - School ratings and information
- **US Census** - Demographics and statistics
- **Google Maps** (optional) - Geocoding and places

## 🛠️ Development

### Create a New Extractor

```python
from scripts.utils.base_extractor import BaseExtractor

class MyExtractor(BaseExtractor):
    def __init__(self):
        super().__init__(source_name="My Source")

    def extract(self):
        # Your extraction logic
        return [{"data": "value"}]
```

### Create a New Transformer

```python
from scripts.utils.base_transformer import BaseTransformer

class MyTransformer(BaseTransformer):
    def __init__(self):
        super().__init__(name="My Transformer")

    def transform(self, data):
        # Your transformation logic
        return [{"clean": item} for item in data]
```

### Create a New Loader

```python
from scripts.etl.loaders.supabase_loader import SupabaseLoader

class MyLoader(SupabaseLoader):
    def __init__(self):
        super().__init__(table_name="my_table")
```

## 📝 Next Steps

1. **Seed Data** - Create sample data for testing
2. **Schedulers** - Set up cron jobs for automated ETL
3. **Monitoring** - Add alerting for pipeline failures
4. **API Layer** - Build REST/GraphQL endpoints
5. **Dashboard** - Create admin dashboard for monitoring

## 📚 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [RentCast API Docs](https://developers.rentcast.io)
- [GreatSchools API Docs](https://www.greatschools.org/api)
- [Census API Docs](https://www.census.gov/data/developers.html)

## 🤝 Contributing

This is part of the Strive real estate platform. See main repository for contribution guidelines.

## 📄 License

Proprietary - Strive Technologies
