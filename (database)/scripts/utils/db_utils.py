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
