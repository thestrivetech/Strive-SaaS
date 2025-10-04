#!/bin/bash

# Deployment Rollback Script
# Rolls back to previous Vercel deployment
# Usage: ./scripts/rollback.sh [deployment-url]

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}╔════════════════════════════════════════╗${NC}"
echo -e "${RED}║        Emergency Rollback Script        ║${NC}"
echo -e "${RED}╚════════════════════════════════════════╝${NC}"
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

# Get deployment URL argument (optional)
TARGET_DEPLOYMENT="$1"

echo -e "${YELLOW}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║              ⚠️  WARNING ⚠️                    ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo "This will rollback production to a previous deployment!"
echo ""

# List recent deployments
echo -e "${BLUE}Recent deployments:${NC}"
echo ""
vercel ls | head -n 10
echo ""

# If no deployment URL provided, ask for it
if [ -z "$TARGET_DEPLOYMENT" ]; then
  echo "Options:"
  echo "  1. Enter deployment URL to rollback to"
  echo "  2. Type 'list' to see more deployments"
  echo "  3. Type 'cancel' to abort"
  echo ""
  read -p "Enter deployment URL or option: " USER_INPUT

  if [ "$USER_INPUT" = "cancel" ]; then
    echo ""
    echo -e "${YELLOW}Rollback cancelled${NC}"
    echo ""
    exit 0
  fi

  if [ "$USER_INPUT" = "list" ]; then
    echo ""
    echo -e "${BLUE}All recent deployments:${NC}"
    echo ""
    vercel ls
    echo ""
    read -p "Enter deployment URL to rollback to: " TARGET_DEPLOYMENT
  else
    TARGET_DEPLOYMENT="$USER_INPUT"
  fi
fi

# Validate deployment URL
if [ -z "$TARGET_DEPLOYMENT" ]; then
  echo ""
  echo -e "${RED}❌ No deployment URL provided${NC}"
  echo ""
  exit 1
fi

echo ""
echo -e "${BLUE}Target deployment:${NC} $TARGET_DEPLOYMENT"
echo ""

# Final confirmation
echo -e "${YELLOW}⚠️  This will make the above deployment live in production${NC}"
echo ""
read -p "Type 'yes' to confirm rollback, or anything else to cancel: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo ""
  echo -e "${YELLOW}Rollback cancelled${NC}"
  echo ""
  exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Rolling back deployment...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Perform rollback using Vercel promote
if vercel promote "$TARGET_DEPLOYMENT" --scope production; then
  echo ""
  echo -e "${GREEN}✅ Rollback successful${NC}"
  echo ""
else
  echo ""
  echo -e "${RED}❌ Rollback failed${NC}"
  echo ""
  echo "Try manual rollback via Vercel Dashboard:"
  echo "  1. Go to https://vercel.com/dashboard"
  echo "  2. Select your project"
  echo "  3. Go to Deployments"
  echo "  4. Find target deployment"
  echo "  5. Click '...' menu → 'Promote to Production'"
  echo ""
  exit 1
fi

# Verify deployment
echo -e "${BLUE}Verifying deployment...${NC}"
echo ""

# Wait a moment for rollback to take effect
sleep 5

HEALTH_URL="https://app.strivetech.ai/api/health"

if curl -f "$HEALTH_URL" -s -o /dev/null; then
  echo -e "${GREEN}✅ Health check passed: $HEALTH_URL${NC}"
  echo ""
else
  echo -e "${YELLOW}⚠️  Health check failed (may take a moment)${NC}"
  echo "Manually verify: $HEALTH_URL"
  echo ""
fi

# Success
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ✅ ROLLBACK COMPLETED SUCCESSFULLY   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Verify app functionality at https://app.strivetech.ai"
echo "  2. Monitor Vercel logs for errors"
echo "  3. Check health endpoint: $HEALTH_URL"
echo "  4. Investigate root cause of issue"
echo "  5. Fix and redeploy when ready"
echo ""

echo -e "${BLUE}Monitoring:${NC}"
echo "  • Vercel Dashboard: ${GREEN}https://vercel.com/dashboard${NC}"
echo "  • View Logs: ${GREEN}vercel logs --follow${NC}"
echo ""

echo -e "${YELLOW}Remember:${NC}"
echo "  • Document what went wrong"
echo "  • Fix the issue before redeploying"
echo "  • Consider if database rollback is needed"
echo "  • Update team on incident and resolution"
echo ""

exit 0
