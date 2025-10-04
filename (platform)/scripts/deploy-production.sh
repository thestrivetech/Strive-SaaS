#!/bin/bash

# Full Production Deployment Workflow
# Runs pre-checks, migrations, and deployment to Vercel
# Usage: ./scripts/deploy-production.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Production Deployment Workflow     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Deployment configuration
DEPLOYMENT_TYPE="production"
VERCEL_ENV="--prod"

echo -e "${BLUE}Deployment Configuration:${NC}"
echo "  Environment: ${GREEN}$DEPLOYMENT_TYPE${NC}"
echo "  Target: ${GREEN}app.strivetech.ai${NC}"
echo ""

# Warning
echo -e "${YELLOW}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║          ⚠️  PRODUCTION DEPLOYMENT ⚠️          ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo "This workflow will:"
echo "  1. Run pre-deployment verification checks"
echo "  2. Deploy application to Vercel (production)"
echo "  3. Prompt for database migration (optional)"
echo ""

# Confirmation
read -p "Continue with deployment? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo ""
  echo -e "${YELLOW}Deployment cancelled${NC}"
  echo ""
  exit 0
fi

echo ""

# Phase 1: Pre-deployment checks
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Phase 1: Pre-Deployment Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "scripts/pre-deploy-check.sh" ]; then
  if bash scripts/pre-deploy-check.sh; then
    echo ""
    echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
    echo ""
  else
    echo ""
    echo -e "${RED}❌ Pre-deployment checks failed${NC}"
    echo "Fix the issues above before deploying"
    echo ""
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Pre-deployment check script not found${NC}"
  echo "Skipping automated checks..."
  echo ""
fi

# Phase 2: Vercel deployment
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Phase 2: Deploying to Vercel${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI not found${NC}"
  echo ""
  echo "Install Vercel CLI:"
  echo "  npm install -g vercel"
  echo ""
  exit 1
fi

echo "Deploying to Vercel (production)..."
echo ""

if vercel $VERCEL_ENV; then
  echo ""
  echo -e "${GREEN}✅ Deployment to Vercel successful${NC}"
  echo ""
else
  echo ""
  echo -e "${RED}❌ Deployment to Vercel failed${NC}"
  echo ""
  echo "Check Vercel dashboard for details:"
  echo "  https://vercel.com/dashboard"
  echo ""
  exit 1
fi

# Phase 3: Database migrations (optional)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Phase 3: Database Migrations (Optional)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Do you need to run database migrations?"
echo "  (Only if schema changed since last deployment)"
echo ""
read -p "Run migrations? (yes/no): " RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" = "yes" ]; then
  echo ""
  if [ -f "scripts/migrate-production.sh" ]; then
    bash scripts/migrate-production.sh
  else
    echo -e "${YELLOW}⚠️  Migration script not found${NC}"
    echo "Run manually:"
    echo "  npx prisma migrate deploy --schema=../shared/prisma/schema.prisma"
    echo ""
  fi
else
  echo ""
  echo -e "${BLUE}ℹ️  Skipping database migrations${NC}"
  echo ""
fi

# Phase 4: Post-deployment verification
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Phase 4: Post-Deployment Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Testing health endpoint..."
HEALTH_URL="https://app.strivetech.ai/api/health"

# Wait a moment for deployment to be live
sleep 5

if curl -f "$HEALTH_URL" -s -o /dev/null; then
  echo -e "${GREEN}✅ Health check passed: $HEALTH_URL${NC}"
  echo ""
else
  echo -e "${YELLOW}⚠️  Health check failed (may take a moment to be live)${NC}"
  echo "Manually verify: $HEALTH_URL"
  echo ""
fi

# Success summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ DEPLOYMENT COMPLETED SUCCESSFULLY ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Deployment URLs:${NC}"
echo "  🌐 Production: ${GREEN}https://app.strivetech.ai${NC}"
echo "  🏥 Health Check: ${GREEN}$HEALTH_URL${NC}"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Verify app is accessible at https://app.strivetech.ai"
echo "  2. Run smoke tests (login, CRM, projects, AI)"
echo "  3. Monitor Vercel logs for errors"
echo "  4. Check health endpoint: $HEALTH_URL"
echo "  5. Monitor for 1 hour minimum"
echo ""

echo -e "${BLUE}Monitoring:${NC}"
echo "  • Vercel Dashboard: ${GREEN}https://vercel.com/dashboard${NC}"
echo "  • View Logs: ${GREEN}vercel logs --follow${NC}"
echo ""

echo -e "${YELLOW}If issues occur:${NC}"
echo "  • Check Vercel logs: vercel logs"
echo "  • Rollback deployment: vercel rollback"
echo "  • See docs/ROLLBACK.md for procedures"
echo ""

exit 0
