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
# Supabase provides a direct PostgreSQL connection string
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DIRECT_URL")
engine = create_engine(DATABASE_URL) if DATABASE_URL else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

def get_db():
    """Get database session"""
    if not SessionLocal:
        raise RuntimeError("Database engine not initialized. Check DATABASE_URL environment variable.")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
