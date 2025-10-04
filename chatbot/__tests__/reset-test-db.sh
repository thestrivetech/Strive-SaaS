#!/bin/bash
# Reset Test Database Script
# Drops all existing tables and recreates schema from scratch

set -e

echo "🧹 Resetting test database..."

# Load test environment variables
if [ -f .env.test ]; then
    export $(cat .env.test | grep -v '^#' | xargs)
else
    echo "❌ .env.test file not found"
    exit 1
fi

echo "📝 Database: $DATABASE_URL"

# Check if PostgreSQL is accessible
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  Note: pg_isready check failed, but continuing anyway..."
    echo "If using remote database (Supabase), this is expected."
fi

# Drop all tables using Prisma
echo "🗑️  Dropping all existing tables..."
npx prisma migrate reset --force --skip-seed

echo "✅ Database reset complete!"
echo ""
echo "Next steps:"
echo "  1. Run migrations: npx prisma migrate deploy"
echo "  2. Generate client: npx prisma generate"
echo "  3. Run tests: npm test"
