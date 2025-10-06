#!/bin/bash

# ==========================================
# STRIVE TECH SAAS - PRISMA DATABASE SETUP SCRIPT
# ==========================================
# This script will set up your new Supabase database with the existing schema
#
# USAGE:
# 1. Update .env.local with new database credentials
# 2. Run: chmod +x prisma-setup-commands.sh
# 3. Run: ./prisma-setup-commands.sh
# ==========================================

set -e

echo "🚀 Starting Strive Tech Database Migration..."
echo "=========================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your new Supabase credentials first."
    exit 1
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=" .env.local; then
    echo "✅ Found DATABASE_URL in .env.local"
else
    echo "❌ Error: DATABASE_URL not found in .env.local"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📊 Checking database connection..."
npx prisma db pull --print || echo "⚠️  Database is empty (expected for new project)"

echo "🛠️  Pushing schema to new database..."
npx prisma db push

echo "🎯 Verifying database setup..."
npx prisma db pull --print | head -20

echo "🌱 Database schema successfully migrated!"
echo "=========================================="
echo ""
echo "✅ MIGRATION COMPLETE!"
echo ""
echo "Next steps:"
echo "1. ✅ Database schema is now set up in your new Supabase project"
echo "2. 🔄 Run 'npm run dev' to start the development server"
echo "3. 🧪 Test database connection by creating a user or organization"
echo "4. 📊 Access Prisma Studio with 'npx prisma studio' to view/edit data"
echo ""
echo "🎉 Your Strive Tech SaaS dashboard is ready to go!"