#!/bin/bash
# Test Database Setup Script

set -e

echo "🧪 Setting up test database..."

# Load test environment variables
export $(cat .env.test | grep -v '^#' | xargs)

echo "📝 Database: $DATABASE_URL"

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL first:"
    echo "  macOS: brew services start postgresql@15"
    echo "  Linux: sudo systemctl start postgresql"
    exit 1
fi

# Create database if it doesn't exist
echo "📦 Creating database if it doesn't exist..."
psql -U postgres -h localhost -p 5432 -tc "SELECT 1 FROM pg_database WHERE datname = 'strive_test'" | grep -q 1 || \
    psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE strive_test"

# Run migrations
echo "🚀 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "✅ Test database setup complete!"
echo ""
echo "You can now run tests with:"
echo "  npm test"
