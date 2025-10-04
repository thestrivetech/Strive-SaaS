#!/bin/bash
# Complete Test Database Setup Script
# Resets database, runs migrations, and prepares for testing

set -e

echo "🚀 Complete Test Database Setup"
echo "================================"
echo ""

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "❌ Error: .env.test file not found"
    echo "Please create .env.test with your database credentials"
    exit 1
fi

# Load test environment variables
echo "📝 Loading environment variables from .env.test..."
export $(cat .env.test | grep -v '^#' | grep -v '^$' | xargs)

echo "📍 Database URL: ${DATABASE_URL:0:50}..."
echo ""

# Step 1: Drop all existing tables
echo "🗑️  Step 1: Dropping all existing tables..."
echo "This will remove all data from the test database."
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

npx prisma migrate reset --force --skip-seed || {
    echo "⚠️  Prisma reset failed. Trying manual cleanup..."

    # Manual cleanup using SQL
    PGPASSWORD=$(echo $DATABASE_URL | grep -oP '(?<=:)[^@]+(?=@)') \
    PGHOST=$(echo $DATABASE_URL | grep -oP '(?<=@)[^:]+') \
    PGPORT=$(echo $DATABASE_URL | grep -oP '(?<=:)\d+(?=/)') \
    PGDATABASE=$(echo $DATABASE_URL | grep -oP '(?<=/)[^?]+') \
    PGUSER=$(echo $DATABASE_URL | grep -oP '(?<=//)[^:]+') \
    psql -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" || {
        echo "❌ Manual cleanup also failed"
        echo "You may need to manually drop tables using:"
        echo "  npx prisma studio"
        echo "  Or connect directly to your database"
        exit 1
    }
}

echo "✅ Existing tables dropped"
echo ""

# Step 2: Run migrations
echo "🚀 Step 2: Running Prisma migrations..."
npx prisma migrate deploy || {
    echo "❌ Migration failed"
    echo "Check your database connection and try again"
    exit 1
}

echo "✅ Migrations applied"
echo ""

# Step 3: Generate Prisma client
echo "⚙️  Step 3: Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"
echo ""

# Step 4: Verify setup
echo "🔍 Step 4: Verifying database setup..."
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" || {
    echo "⚠️  Could not verify tables (this may be normal)"
}

echo ""
echo "✅ ============================================"
echo "✅ Test database setup complete!"
echo "✅ ============================================"
echo ""
echo "You can now run tests:"
echo "  npm test                    # Run all tests"
echo "  npm test -- --watch         # Watch mode"
echo "  npm run test:coverage       # With coverage"
echo ""
echo "Test database will be cleaned between each test automatically."
echo "No further setup needed!"
