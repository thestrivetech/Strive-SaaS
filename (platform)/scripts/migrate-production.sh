#!/bin/bash

# Production Database Migration Script
# Safely runs Prisma migrations on production database
# Usage: ./scripts/migrate-production.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Production Database Migration       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ ERROR: DATABASE_URL environment variable not set${NC}"
  echo ""
  echo "Please set DATABASE_URL to your production database:"
  echo "  export DATABASE_URL='postgresql://...'"
  echo ""
  exit 1
fi

# Display database URL (masked for security)
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:****@/')
echo -e "${BLUE}Target Database:${NC} $MASKED_URL"
echo ""

# Warning
echo -e "${YELLOW}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║          ⚠️  PRODUCTION WARNING ⚠️             ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}This will run migrations on your PRODUCTION database!${NC}"
echo ""
echo "This operation will:"
echo "  • Apply pending database migrations"
echo "  • Modify database schema"
echo "  • Potentially cause temporary downtime"
echo ""
echo -e "${RED}⚠️  IMPORTANT:${NC}"
echo "  1. Ensure you have a recent database backup"
echo "  2. Verify migrations in staging first"
echo "  3. Consider maintenance window if needed"
echo "  4. Have rollback plan ready"
echo ""

# Confirmation
read -p "Type 'yes' to continue, or anything else to cancel: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo ""
  echo -e "${YELLOW}Migration cancelled by user${NC}"
  echo ""
  exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Starting migration process...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check migration status
echo -e "${BLUE}[1/3] Checking migration status...${NC}"
echo ""

if npx prisma migrate status --schema=../shared/prisma/schema.prisma; then
  echo ""
  echo -e "${GREEN}✅ Migration status retrieved${NC}"
  echo ""
else
  echo ""
  echo -e "${RED}❌ Failed to retrieve migration status${NC}"
  echo ""
  exit 1
fi

# Ask for final confirmation after seeing status
read -p "Proceed with applying migrations? (yes/no): " FINAL_CONFIRM

if [ "$FINAL_CONFIRM" != "yes" ]; then
  echo ""
  echo -e "${YELLOW}Migration cancelled${NC}"
  echo ""
  exit 0
fi

echo ""

# Step 2: Deploy migrations
echo -e "${BLUE}[2/3] Deploying migrations...${NC}"
echo ""

if npx prisma migrate deploy --schema=../shared/prisma/schema.prisma; then
  echo ""
  echo -e "${GREEN}✅ Migrations deployed successfully${NC}"
  echo ""
else
  echo ""
  echo -e "${RED}❌ Migration deployment failed${NC}"
  echo ""
  echo "Rollback may be required. Check migration status with:"
  echo "  npx prisma migrate status --schema=../shared/prisma/schema.prisma"
  echo ""
  exit 1
fi

# Step 3: Generate Prisma Client
echo -e "${BLUE}[3/3] Generating Prisma Client...${NC}"
echo ""

if npx prisma generate --schema=../shared/prisma/schema.prisma; then
  echo ""
  echo -e "${GREEN}✅ Prisma Client generated${NC}"
  echo ""
else
  echo ""
  echo -e "${YELLOW}⚠️  Prisma Client generation failed (non-critical)${NC}"
  echo "You may need to run 'npm run prisma:generate' manually"
  echo ""
fi

# Success
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Migration Completed Successfully  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo "  1. Verify application connects to database"
echo "  2. Test critical functionality"
echo "  3. Monitor application logs"
echo "  4. Check database performance"
echo ""

echo -e "${BLUE}If issues occur:${NC}"
echo "  1. Check migration status"
echo "  2. Review application logs"
echo "  3. Consider rollback if necessary"
echo "  4. See docs/ROLLBACK.md for procedures"
echo ""

exit 0
