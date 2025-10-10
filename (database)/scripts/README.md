# Strive ETL Architecture

## Overview
This directory contains the Extract, Transform, Load (ETL) pipeline for the Strive real estate database.

## Directory Structure
```
scripts/
├── etl/
│   ├── extractors/     # Data extraction from APIs, files, etc.
│   ├── transformers/   # Data transformation and cleaning
│   ├── loaders/        # Data loading into Supabase
│   └── validators/     # Data validation schemas
├── utils/              # Utility functions and base classes
│   ├── base_extractor.py
│   ├── base_transformer.py
│   ├── base_loader.py
│   ├── geo_utils.py
│   └── db_utils.py
```

## Configuration
All configuration is in the `config/` directory:
- `database.py` - Database connections (Supabase + SQLAlchemy)
- `logging_config.py` - Loguru logging setup
- `settings.py` - Pydantic settings with environment variables

## Base Classes

### BaseExtractor
Abstract base class for all extractors. Provides:
- Automatic logging
- Performance timing
- Error handling

Example usage:
```python
from scripts.utils.base_extractor import BaseExtractor

class MyExtractor(BaseExtractor):
    def __init__(self):
        super().__init__(source_name="My Data Source")

    def extract(self):
        # Your extraction logic
        return [{"data": "value"}]

# Use it
extractor = MyExtractor()
data = extractor.run()
```

### BaseTransformer
Abstract base class for all transformers. Provides:
- Logging
- Success/failure tracking

Example usage:
```python
from scripts.utils.base_transformer import BaseTransformer

class MyTransformer(BaseTransformer):
    def __init__(self):
        super().__init__(name="My Transformer")

    def transform(self, data):
        # Your transformation logic
        return [{"transformed": item} for item in data]

# Use it
transformer = MyTransformer()
transformed_data = transformer.run(raw_data)
```

### BaseLoader
Abstract base class for all loaders. Provides:
- Logging
- Performance timing
- Error handling

Example usage:
```python
from scripts.utils.base_loader import BaseLoader
from scripts.utils.db_utils import bulk_insert

class MyLoader(BaseLoader):
    def __init__(self):
        super().__init__(table_name="properties")

    def load(self, data):
        self.records_loaded = bulk_insert(self.table_name, data)

# Use it
loader = MyLoader()
loader.run(data)
```

## Validators

### PropertyRecord
Pydantic model for property validation:

```python
from scripts.etl.validators.property_validator import validate_property_batch

# Validate a batch of properties
valid_records, invalid_records = validate_property_batch(raw_data)

print(f"Valid: {len(valid_records)}, Invalid: {len(invalid_records)}")
```

## Utilities

### geo_utils.py
Geographic utility functions:
- `parse_address()` - Parse address into components
- `validate_coordinates()` - Validate lat/lng
- `calculate_distance()` - Calculate distance between points

### db_utils.py
Database utility functions:
- `bulk_insert()` - Bulk insert with batching
- `upsert()` - Insert or update on conflict
- `execute_query()` - Execute raw SQL

## Data Flow

```
Extract → Transform → Validate → Load
   ↓          ↓          ↓         ↓
 API/File   Clean     Pydantic  Supabase
           Normalize   Check    Database
```

## Installation

Install dependencies:
```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the `supabase/` directory:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# Optional API keys
RENTCAST_API_KEY=your-key
GREATSCHOOLS_API_KEY=your-key
CENSUS_API_KEY=your-key
```

## Logging

Logs are automatically written to:
- Console (INFO level)
- `data/logs/etl_YYYY-MM-DD.log` (DEBUG level)

Logs rotate daily and are retained for 30 days.

## Next Steps

1. Create specific extractors in `etl/extractors/`
2. Create specific transformers in `etl/transformers/`
3. Create specific loaders in `etl/loaders/`
4. Build end-to-end pipelines combining E→T→L

## Example Pipeline

```python
from scripts.etl.extractors.my_extractor import MyExtractor
from scripts.etl.transformers.my_transformer import MyTransformer
from scripts.etl.loaders.my_loader import MyLoader

# Extract
extractor = MyExtractor()
raw_data = extractor.run()

# Transform
transformer = MyTransformer()
clean_data = transformer.run(raw_data)

# Load
loader = MyLoader()
loader.run(clean_data)
```
