# CLAUDE.md - Strive Real Estate Database

**Claude's Session Memory | v1.0 | Real Estate Data Powerhouse**

> ## 🔴 CRITICAL: DUAL-DATABASE ARCHITECTURE
>
> This is NOT a typical application - it's a **MASSIVE REAL ESTATE DATABASE**
> that powers the entire Strive platform. Two databases work in tandem:
>
> **Supabase (PostgreSQL)** - Structured statistical data, metrics, property records
> **Qdrant (Vector DB)** - Regional knowledge embeddings for RAG system
>
> This database is **REGION-SPECIFIC** and scales as the platform scales.

---

## 📁 Project Structure

```
(database)/
├── supabase/                   # Structured data layer
│   ├── migrations/            # PostgreSQL migrations
│   ├── seed/                  # Initial data seeding scripts
│   ├── functions/             # Database functions/triggers
│   ├── requirements.txt       # Python dependencies for scripts
│   └── config.toml            # Supabase local config
├── qdrant/                     # Vector database layer
│   ├── collections/           # Vector collection schemas
│   ├── embeddings/            # Embedding generation scripts
│   ├── ingest/                # Data ingestion pipelines
│   └── config/                # Qdrant configuration
├── scripts/                    # Data pipeline scripts
│   ├── etl/                   # Extract, Transform, Load
│   ├── sync/                  # Cross-database sync
│   └── validation/            # Data quality checks
├── docs/                       # Database documentation
│   ├── schema.md              # Database schema documentation
│   ├── data-sources.md        # External data source specs
│   └── api.md                 # Database API documentation
├── CLAUDE.md                   # THIS FILE
├── PLAN.md                     # Development roadmap
└── README.md                   # Setup instructions
```

---

## 🎯 Project Purpose

**Mission:** Build the most comprehensive, scalable real estate database that powers:
- Property valuations and analytics
- Market trend predictions
- Neighborhood insights
- Investment opportunity scoring
- Rental market analysis
- Regional demographic data
- Historical price movements
- Regulatory and zoning information

**Key Principles:**
1. **Comprehensive** - Every metric imaginable
2. **Regional** - Hyper-localized, scales by region
3. **Accurate** - Multi-source validation
4. **Real-time** - Continuous data updates
5. **Queryable** - Fast access patterns for platform
6. **Vector-enhanced** - Semantic search on regional knowledge

---

## 🏗️ Dual-Database Architecture

### Supabase (PostgreSQL) - Structured Layer

**Purpose:** Store all quantitative, structured real estate data

**Data Categories:**

1. **Property Records**
   - Addresses, parcels, ownership
   - Square footage, bedrooms, bathrooms
   - Year built, renovations, condition
   - Property type, zoning classification

2. **Market Metrics**
   - Sales prices (historical & current)
   - Rental rates (market & actual)
   - Days on market, inventory levels
   - Price per square foot trends
   - Cap rates, ROI calculations

3. **Geographic Data**
   - Coordinates (lat/long)
   - Boundaries (city, county, zip, neighborhood)
   - School districts, voting precincts
   - Census tracts, block groups

4. **Economic Indicators**
   - Median household income by area
   - Employment rates, job growth
   - Population growth, demographics
   - Cost of living indices
   - Tax rates (property, sales, income)

5. **Infrastructure & Amenities**
   - Schools (ratings, test scores, distance)
   - Transit (bus, rail, highway access)
   - Parks, recreation, green space
   - Hospitals, emergency services
   - Shopping, dining, entertainment

6. **Regulatory & Compliance**
   - Zoning codes, permitted uses
   - Building codes, restrictions
   - HOA rules, fees
   - Environmental hazards (flood zones, etc.)
   - Permits, violations history

7. **Market Predictions**
   - Price forecasts (ML-generated)
   - Appreciation rates
   - Investment scores
   - Risk assessments

**Schema Design Principles:**
```sql
-- ✅ DO: Normalize for data integrity
CREATE TABLE properties (
    id UUID PRIMARY KEY,
    address TEXT NOT NULL,
    region_id UUID REFERENCES regions(id),
    property_type_id INT REFERENCES property_types(id),
    -- Metrics change over time
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_metrics (
    id UUID PRIMARY KEY,
    property_id UUID REFERENCES properties(id),
    metric_date DATE NOT NULL,
    sale_price NUMERIC(12,2),
    rental_estimate NUMERIC(10,2),
    -- Time-series data
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ DO: Index for common queries
CREATE INDEX idx_properties_region ON properties(region_id);
CREATE INDEX idx_metrics_date ON property_metrics(metric_date DESC);
CREATE INDEX idx_properties_location ON properties USING GIST(location);

-- ❌ DON'T: Store derived data that can be calculated
-- Calculate on query or use materialized views
```

---

### Qdrant (Vector DB) - Semantic Layer

**Purpose:** Store regional knowledge embeddings for RAG system

**Vector Collections:**

1. **Regional Narratives**
   - Neighborhood descriptions
   - Market commentary
   - Historical context
   - Local culture, vibe

2. **Regulatory Texts**
   - Zoning ordinances (full text)
   - Building codes
   - Local laws, regulations
   - HOA documents

3. **Market Reports**
   - Analyst reports, market studies
   - Economic development plans
   - Urban planning documents
   - Investment theses

4. **Property Descriptions**
   - Listing descriptions (historical)
   - Inspection reports
   - Appraisal narratives
   - Agent notes

5. **News & Events**
   - Local news articles
   - Development announcements
   - Economic indicators news
   - Community events

**Collection Schema:**
```python
# ✅ DO: Structure collections by data type and access pattern
{
    "collection_name": "regional_narratives",
    "vectors": {
        "size": 1536,  # OpenAI ada-002 dimension
        "distance": "Cosine"
    },
    "payload_schema": {
        "region_id": "uuid",           # Links to Supabase
        "content_type": "keyword",     # narrative, regulation, report, etc.
        "source": "text",              # Where data came from
        "date": "datetime",            # When published/updated
        "title": "text",
        "content": "text",             # Full text content
        "metadata": "json"             # Additional context
    }
}

# ✅ DO: Create indexes for filtering
client.create_payload_index(
    collection_name="regional_narratives",
    field_name="region_id",
    field_schema="keyword"
)
```

**Embedding Strategy:**
```python
# ✅ DO: Chunk large documents intelligently
def chunk_document(text: str, max_tokens: int = 500) -> List[str]:
    """
    Split by semantic boundaries (paragraphs, sections)
    Not by arbitrary character counts
    """
    # Use langchain or semantic-text-splitter
    pass

# ✅ DO: Store both embedding and original text
vector_point = {
    "id": uuid4(),
    "vector": embedding,  # 1536-dim vector
    "payload": {
        "content": original_text,  # Always keep original
        "region_id": region_id,
        "metadata": {...}
    }
}

# ❌ DON'T: Embed without context
# Always include regional context in the embedded text
```

---

## 🔄 Data Pipeline Architecture

### ETL Process

**Extract:**
```python
# Data sources (examples)
sources = [
    "Zillow API",           # Property listings
    "RentCast API",         # Rental data
    "Census Bureau API",    # Demographics
    "BLS API",              # Employment data
    "Local MLS feeds",      # Direct MLS access
    "County assessor APIs", # Tax records
    "Web scraping",         # When no API available
]

# ✅ DO: Validate at ingestion
@dataclass
class PropertyRecord:
    address: str
    city: str
    state: str
    zip_code: str

    def __post_init__(self):
        assert len(self.zip_code) == 5, "Invalid ZIP"
        assert self.state in VALID_STATES
        # Normalize address format
        self.address = normalize_address(self.address)
```

**Transform:**
```python
# ✅ DO: Standardize all incoming data
def transform_property_data(raw_data: Dict) -> PropertyRecord:
    """
    - Normalize addresses (uppercase, abbreviations)
    - Convert units (sqft, acres)
    - Validate coordinates (lat/long range)
    - Deduplicate (multiple sources, same property)
    - Enrich (geocoding, region assignment)
    """
    pass

# ✅ DO: Handle conflicts with rules
def resolve_data_conflict(records: List[PropertyRecord]) -> PropertyRecord:
    """
    Multiple sources may have different data for same property.

    Priority rules:
    1. Government records (most authoritative)
    2. MLS data (if recent)
    3. Third-party APIs (as backup)
    """
    pass
```

**Load:**
```python
# ✅ DO: Batch inserts for performance
async def load_to_supabase(records: List[PropertyRecord]):
    """
    Use bulk insert, not row-by-row
    """
    await supabase.table('properties').insert(
        [r.dict() for r in records]
    ).execute()

async def load_to_qdrant(embeddings: List[VectorPoint]):
    """
    Batch upsert to Qdrant
    """
    client.upsert(
        collection_name="regional_narratives",
        points=embeddings,
        wait=True  # Ensure indexed before returning
    )
```

### Sync Strategy

**Supabase ↔ Qdrant Sync:**
```python
# Keep region_id consistent across both databases
# When property is added to Supabase:
#   1. Generate description embedding
#   2. Store in Qdrant with same region_id
#   3. Link via region_id in queries

# ✅ DO: Use events/webhooks for sync
@supabase.on('properties', 'INSERT')
async def sync_to_qdrant(record):
    """Triggered when new property added"""
    description = generate_property_description(record)
    embedding = get_embedding(description)
    await qdrant_client.upsert(...)
```

---

## 📊 Data Quality & Validation

### Critical Rules

**1. Address Validation:**
```python
# ✅ ALWAYS normalize addresses
from usaddress import parse, tag

def normalize_address(raw: str) -> str:
    """Use USPS standards"""
    parsed, _ = tag(raw)
    # ST -> Street, AVE -> Avenue, etc.
    return standardize(parsed)

# ✅ ALWAYS geocode and validate
from geopy.geocoders import Nominatim

def validate_coordinates(lat: float, lng: float, address: str) -> bool:
    """Ensure coordinates match address"""
    reverse_geocode = geocoder.reverse(f"{lat}, {lng}")
    return addresses_match(reverse_geocode.address, address)
```

**2. Price Validation:**
```python
# ✅ Detect outliers
def validate_price(price: float, property_type: str, region: str) -> bool:
    """Flag prices outside 3 standard deviations"""
    regional_stats = get_price_stats(property_type, region)
    z_score = (price - regional_stats.mean) / regional_stats.std

    if abs(z_score) > 3:
        log_for_manual_review(price, property_type, region)
        return False
    return True

# ❌ DON'T trust raw prices blindly
# Verify against multiple sources
```

**3. Temporal Consistency:**
```python
# ✅ Ensure chronological order
def validate_temporal_data(records: List[PropertyMetric]) -> bool:
    """Sale dates, price changes must be chronological"""
    sorted_records = sorted(records, key=lambda r: r.metric_date)

    # Can't sell before built
    if any(r.sale_date < r.year_built for r in records):
        return False

    # Prices shouldn't jump unrealistically
    for i in range(1, len(sorted_records)):
        change = abs(sorted_records[i].price - sorted_records[i-1].price)
        if change > 0.5 * sorted_records[i-1].price:  # 50% jump
            flag_for_review(sorted_records[i])

    return True
```

---

## 🚀 Scaling Strategy

### Regional Expansion

**Phase 1: Core Markets (Current)**
```
- Major metro areas (NYC, LA, SF, Chicago, etc.)
- High transaction volume
- Good data availability
```

**Phase 2: Secondary Markets**
```
- Mid-size cities
- Suburban areas around core markets
- Regional economic centers
```

**Phase 3: National Coverage**
```
- All US markets
- Rural areas
- Vacation/resort markets
```

**Phase 4: International** (Future)
```
- Canada, UK, Australia (English-speaking)
- Other international markets as needed
```

### Database Scaling

**Supabase Scaling:**
```sql
-- ✅ DO: Partition by region for horizontal scaling
CREATE TABLE properties (
    id UUID PRIMARY KEY,
    region_id UUID NOT NULL,
    -- ... other columns
) PARTITION BY RANGE (region_id);

-- Create partition per major region
CREATE TABLE properties_west PARTITION OF properties
    FOR VALUES FROM ('west-start-uuid') TO ('west-end-uuid');

CREATE TABLE properties_east PARTITION OF properties
    FOR VALUES FROM ('east-start-uuid') TO ('east-end-uuid');

-- ✅ DO: Archive old data
-- Move historical data (>5 years) to cold storage
-- Keep hot data for fast queries
```

**Qdrant Scaling:**
```python
# ✅ DO: Use collection per region for large scale
regions = ['us-west', 'us-east', 'us-central', 'us-south']

for region in regions:
    client.create_collection(
        collection_name=f"regional_narratives_{region}",
        vectors_config={...}
    )

# Query specific region collection for faster results
results = client.search(
    collection_name=f"regional_narratives_{user_region}",
    query_vector=embedding,
    limit=10
)
```

---

## 🔒 Security & Privacy

### Data Classification

**Public Data (No restrictions):**
- Aggregated statistics
- Market-level trends
- Public records (property sales, tax data)

**Sensitive Data (Restricted):**
- Owner contact information
- Financial details beyond public record
- Proprietary predictions/scores

**Internal Only:**
- Data source credentials
- ML model weights
- Embedding generation costs

### Access Control

```python
# ✅ DO: Implement RLS in Supabase
-- Only allow read access to regional data based on user subscription
CREATE POLICY "Users can read their subscribed regions"
ON properties FOR SELECT
USING (
    region_id IN (
        SELECT region_id
        FROM user_subscriptions
        WHERE user_id = auth.uid()
    )
);

# ✅ DO: Filter Qdrant results by region access
async def query_regional_knowledge(
    user_id: str,
    query: str,
    region_id: str
) -> List[VectorResult]:
    """Only return results for regions user has access to"""

    # Check user subscription
    has_access = await check_region_access(user_id, region_id)
    if not has_access:
        raise PermissionError(f"No access to region {region_id}")

    return qdrant_client.search(
        collection_name="regional_narratives",
        query_vector=get_embedding(query),
        query_filter={
            "must": [
                {"key": "region_id", "match": {"value": region_id}}
            ]
        }
    )
```

---

## 🔗 Integration with Platform

### Chatbot Integration (RAG)

```python
# Chatbot queries Qdrant for regional knowledge
async def chatbot_query(user_message: str, region_id: str) -> str:
    """
    1. Generate embedding from user question
    2. Search Qdrant for relevant regional context
    3. Augment prompt with context
    4. Send to LLM (KimiK2)
    5. Return response
    """

    # Semantic search in Qdrant
    embedding = await get_embedding(user_message)
    context_results = qdrant_client.search(
        collection_name="regional_narratives",
        query_vector=embedding,
        query_filter={"must": [{"key": "region_id", "match": region_id}]},
        limit=5
    )

    # Build context
    context = "\n\n".join([r.payload['content'] for r in context_results])

    # Query Supabase for stats
    stats = await supabase.rpc('get_region_stats', {'rid': region_id}).execute()

    # Augmented prompt
    prompt = f"""
    Context from regional knowledge base:
    {context}

    Current market statistics:
    {stats.data}

    User question: {user_message}

    Provide a detailed, accurate answer based on the context above.
    """

    return await llm.generate(prompt)
```

### Platform Dashboard Integration

```typescript
// Platform queries Supabase for analytics
interface RegionalAnalytics {
  regionId: string;
  medianPrice: number;
  averageRent: number;
  marketTrend: 'up' | 'down' | 'stable';
  topNeighborhoods: Neighborhood[];
  // ... all metrics
}

async function getRegionalAnalytics(
  regionId: string
): Promise<RegionalAnalytics> {
  // Direct Supabase query
  const { data } = await supabase
    .rpc('calculate_regional_analytics', { region_id: regionId })
    .single();

  return data;
}
```

---

## 📏 Standards & Conventions

### File Size Limits
- Python scripts: 500 lines max
- SQL migrations: 1000 lines max (complex schemas)
- Config files: No limit (generated)

### Naming Conventions

**Database Tables (Supabase):**
```sql
-- Plural, snake_case
properties
property_metrics
market_trends
regional_demographics

-- Junction tables: table1_table2
properties_amenities
regions_schools
```

**Collections (Qdrant):**
```python
# Singular, descriptive
"regional_narrative"
"regulatory_document"
"market_report"
"property_description"
```

**Scripts:**
```
# Action_source_destination.py
extract_zillow_properties.py
transform_census_data.py
load_supabase_metrics.py
sync_qdrant_embeddings.py
```

### Documentation

**Every table must have:**
```sql
COMMENT ON TABLE properties IS
'Core property records. One row per unique property address.
Updated daily from MLS feeds and county assessor APIs.';

COMMENT ON COLUMN properties.region_id IS
'Foreign key to regions table. Used for partitioning and access control.';
```

**Every collection must have:**
```python
COLLECTIONS = {
    "regional_narratives": {
        "description": "Text embeddings of neighborhood descriptions, market commentary, and regional context",
        "update_frequency": "weekly",
        "data_sources": ["Zillow", "Realtor.com", "local news"],
        "vector_dim": 1536,
        "avg_chunk_size": 500
    }
}
```

---

## 🧪 Testing & Validation

### Data Quality Tests

```python
# Run daily
def test_address_completeness():
    """All properties must have complete addresses"""
    incomplete = supabase.table('properties')\
        .select('id')\
        .or('address.is.null,city.is.null,state.is.null')\
        .execute()

    assert len(incomplete.data) == 0, f"Found {len(incomplete.data)} incomplete addresses"

def test_price_reasonableness():
    """Prices should be within reasonable ranges"""
    outliers = supabase.rpc('find_price_outliers').execute()
    assert len(outliers.data) < 100, f"Too many outliers: {len(outliers.data)}"

def test_geographic_consistency():
    """Coordinates should be within region boundaries"""
    # Query properties where coordinates don't match region boundaries
    inconsistent = supabase.rpc('check_geographic_consistency').execute()
    assert len(inconsistent.data) == 0

def test_qdrant_sync():
    """Every region in Supabase should have vectors in Qdrant"""
    regions = supabase.table('regions').select('id').execute()

    for region in regions.data:
        count = qdrant_client.count(
            collection_name="regional_narratives",
            count_filter={"must": [{"key": "region_id", "match": region['id']}]}
        )
        assert count.count > 0, f"No vectors for region {region['id']}"
```

### Performance Tests

```python
# Run weekly
def test_query_performance():
    """Common queries should complete in < 100ms"""

    # Test Supabase
    start = time.time()
    supabase.table('properties')\
        .select('*')\
        .eq('region_id', test_region_id)\
        .limit(100)\
        .execute()
    duration = time.time() - start
    assert duration < 0.1, f"Query took {duration}s"

    # Test Qdrant
    start = time.time()
    qdrant_client.search(
        collection_name="regional_narratives",
        query_vector=test_embedding,
        limit=10
    )
    duration = time.time() - start
    assert duration < 0.1, f"Vector search took {duration}s"
```

---

## 🚨 Critical Rules

### ❌ NEVER DO THIS

```python
# DON'T store embeddings in Supabase
# Use Qdrant for all vector operations
❌ CREATE TABLE property_embeddings (vector FLOAT[]);

# DON'T store full text in Supabase that belongs in Qdrant
❌ INSERT INTO properties (description) VALUES ('Long narrative text...');

# DON'T bypass validation
❌ INSERT INTO properties VALUES (...);  # Without validation

# DON'T query entire dataset without filters
❌ SELECT * FROM properties;  # Use WHERE region_id = ...

# DON'T expose raw coordinates without permission check
❌ return {lat: property.lat, lng: property.lng};  # Check user access first

# DON'T run migrations without backup
❌ ALTER TABLE properties DROP COLUMN ...;  # Backup first!
```

### ✅ ALWAYS DO THIS

```python
# ✅ Validate before inserting
record = PropertyRecord(**raw_data)
record.validate()
insert_to_db(record)

# ✅ Use region filters
properties = supabase.table('properties')\
    .select('*')\
    .eq('region_id', user_region_id)\
    .execute()

# ✅ Batch operations
records = [PropertyRecord(**r) for r in raw_records]
bulk_insert(records)

# ✅ Log all data changes
logger.info(f"Inserted {len(records)} properties to region {region_id}")

# ✅ Monitor performance
@timer
def expensive_operation():
    pass

# ✅ Document data sources
"""
Data extracted from Zillow API on 2025-10-09
Endpoint: /v1/property/{zpid}
Rate limit: 1000 req/day
"""
```

---

## 🎯 Development Workflow

### Adding New Data Source

1. **Document source:**
   ```python
   # docs/data-sources.md
   ## RentCast API
   - Endpoint: https://api.rentcast.io/v1
   - Auth: API Key in header
   - Rate Limit: 10,000/month
   - Data: Rental estimates, market rents
   - Update Frequency: Daily
   ```

2. **Create extractor:**
   ```python
   # scripts/etl/extract_rentcast_data.py
   async def extract():
       # Fetch from API
       # Validate response
       # Return structured data
   ```

3. **Create transformer:**
   ```python
   # scripts/etl/transform_rentcast_data.py
   def transform(raw_data):
       # Normalize to schema
       # Validate
       # Enrich
   ```

4. **Update loader:**
   ```python
   # scripts/etl/load_rentcast_data.py
   async def load(records):
       # Bulk insert to Supabase
       # Generate embeddings if needed
       # Sync to Qdrant
   ```

5. **Add tests:**
   ```python
   # tests/test_rentcast_pipeline.py
   def test_extraction():
       # Mock API response
       # Verify parsing
   ```

6. **Schedule:**
   ```yaml
   # Add to cron or orchestrator
   - name: rentcast_daily_sync
     schedule: "0 2 * * *"  # 2 AM daily
     script: python scripts/etl/extract_rentcast_data.py
   ```

---

## 📞 External Integrations

### Data Sources to Integrate

**Priority 1 (Core):**
- ✅ Zillow API - Property listings, Zestimates
- ✅ RentCast API - Rental data
- 🔄 Census Bureau - Demographics
- 🔄 BLS - Employment, economic data
- 🔄 MLS Direct Feeds - (as partnerships form)

**Priority 2 (Enhancement):**
- 📋 Walk Score API - Walkability, transit
- 📋 GreatSchools API - School ratings
- 📋 Google Places API - Amenities, POIs
- 📋 Climate Data APIs - Weather, disasters
- 📋 Crime Data APIs - Safety metrics

**Priority 3 (Advanced):**
- 📋 Satellite Imagery - Property condition, land use
- 📋 Building Permits - Development activity
- 📋 Social Media - Sentiment analysis
- 📋 Traffic Data - Commute times
- 📋 Environmental Data - Air quality, noise

### API Management

```python
# ✅ Centralize API clients
class RentCastClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.rentcast.io/v1"
        self.rate_limiter = RateLimiter(10000, 'monthly')

    @retry(max_attempts=3, backoff=exponential)
    async def get_rental_estimate(self, address: str) -> RentalData:
        await self.rate_limiter.acquire()
        # Make request
        # Handle errors
        # Return typed data

# ✅ Log all API calls
logger.info(f"API call: RentCast /rental-estimate address={address}")
```

---

## 📊 Monitoring & Observability

### Key Metrics to Track

**Data Pipeline:**
- Records processed per day
- Data source uptime
- Validation error rates
- Processing latency

**Database Performance:**
- Query response times (p50, p95, p99)
- Index hit rates
- Storage growth rate
- Backup success rate

**Data Quality:**
- Completeness (% of required fields populated)
- Accuracy (vs. ground truth samples)
- Freshness (time since last update)
- Consistency (cross-source agreement)

**Usage:**
- Queries per second (by region)
- Most queried regions
- RAG retrieval accuracy
- Platform integration health

```python
# Example monitoring
@monitor(metrics=['duration', 'error_rate'])
async def daily_etl_job():
    try:
        records = await extract()
        transformed = transform(records)
        await load(transformed)

        metrics.gauge('records_processed', len(records))
        metrics.gauge('data_freshness', time.time() - min(r.updated_at for r in records))
    except Exception as e:
        metrics.increment('etl_errors')
        raise
```

---

## 🎓 Learning Resources

### Required Knowledge

**Databases:**
- PostgreSQL (advanced): Partitioning, indexing, query optimization
- Vector databases: Qdrant or Milvus architecture
- Time-series data: Handling historical metrics efficiently

**APIs & ETL:**
- REST API best practices
- Rate limiting, retry logic
- Data validation (Pydantic, Zod)
- Batch processing

**Real Estate Domain:**
- Property valuation methods (comps, cap rate, DCF)
- Market analysis techniques
- Regulatory landscape (zoning, building codes)
- MLS data standards

**ML/Embeddings:**
- Text embeddings (OpenAI, sentence-transformers)
- Semantic search
- RAG architecture
- Vector similarity metrics

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Qdrant Docs](https://qdrant.tech/documentation/)
- [Zillow API Docs](https://www.zillow.com/howto/api/APIOverview.htm)
- [Census Bureau API](https://www.census.gov/data/developers.html)

---

## 🚀 Current Priorities

See [`PLAN.md`](PLAN.md) for detailed roadmap.

**Immediate (This Week):**
1. ✅ Set up Supabase local instance
2. ✅ Set up Qdrant local instance
3. 🔄 Design core schema (properties, regions, metrics)
4. 🔄 Build first ETL pipeline (Zillow → Supabase)
5. 🔄 Generate first embeddings (property descriptions → Qdrant)

**Short-term (This Month):**
- Multi-source data ingestion (Zillow, RentCast, Census)
- Region definition & partitioning strategy
- Basic RAG integration with chatbot
- Data quality monitoring dashboard

**Long-term (This Quarter):**
- Scale to 50+ metro areas
- Advanced ML predictions
- Real-time data updates
- International expansion planning

---

**Remember:** This database is the FOUNDATION of the entire Strive platform. Data quality, accuracy, and performance are CRITICAL. Every record matters. Every query counts. Build for scale from day one.

**Last Updated:** 2025-10-09
**Version:** 1.0
**Status:** 🚧 Initial Setup Phase
