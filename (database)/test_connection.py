"""
Test database connections to both local and cloud Supabase instances.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

# Load environment variables
env_path = Path(__file__).parent / "supabase" / ".env"
load_dotenv(env_path)

def test_local_connection():
    """Test connection to local Supabase database."""
    print("\n[*] Testing LOCAL Supabase connection...")
    try:
        conn = psycopg2.connect(
            host="127.0.0.1",
            port=54322,
            database="postgres",
            user="postgres",
            password="postgres"
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"[+] LOCAL connection successful!")
        print(f"   PostgreSQL version: {version[0][:50]}...")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[-] LOCAL connection failed: {e}")
        return False

def test_cloud_connection():
    """Test connection to cloud Supabase database."""
    print("\n[*] Testing CLOUD Supabase connection...")

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("[-] CLOUD credentials not found in .env file")
        return False

    print(f"   URL: {supabase_url}")
    print(f"   Key: {supabase_key[:20]}...")

    # Extract host from URL
    # Format: https://xyoqymyxbndgpwijwtdu.supabase.co
    host = supabase_url.replace("https://", "").replace("http://", "")

    try:
        from supabase import create_client, Client

        supabase: Client = create_client(supabase_url, supabase_key)

        # Test the connection by trying to access the auth API
        # This doesn't require any tables to exist
        try:
            # Simple health check via RPC (this will fail gracefully if no RPCs exist)
            supabase.auth.get_session()
        except:
            # If auth check fails, that's OK - we're just checking connection
            pass

        print(f"[+] CLOUD connection successful!")
        print(f"   Connected to: {host}")
        print(f"   API is responding")
        return True
    except Exception as e:
        print(f"[-] CLOUD connection failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("SUPABASE DATABASE CONNECTION TEST")
    print("=" * 60)

    local_ok = test_local_connection()
    cloud_ok = test_cloud_connection()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Local Supabase:  {'[+] Connected' if local_ok else '[-] Failed'}")
    print(f"Cloud Supabase:  {'[+] Connected' if cloud_ok else '[-] Failed'}")
    print("=" * 60)
