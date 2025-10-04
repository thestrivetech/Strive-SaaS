#!/bin/bash

# Pre-Deployment Verification Script
# Runs all quality checks before deploying to production
# Usage: ./scripts/pre-deploy-check.sh

set -e  # Exit on first error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
CHECKS_PASSED=0
CHECKS_FAILED=0

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Pre-Deployment Verification Check   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Helper function to print step header
print_step() {
  local step_number=$1
  local step_name=$2
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Step $step_number: $step_name${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Helper function to print success
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
  echo ""
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

# Helper function to print error
print_error() {
  echo -e "${RED}❌ $1${NC}"
  echo ""
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

# Helper function to print warning
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  echo ""
}

# Check 1: Verify environment
print_step "1/6" "Environment Check"

if [ ! -d "node_modules" ]; then
  print_error "node_modules not found. Run 'npm install' first."
  exit 1
fi

if [ ! -f "package.json" ]; then
  print_error "package.json not found. Are you in the correct directory?"
  exit 1
fi

print_success "Environment verified"

# Check 2: Run tests with coverage
print_step "2/6" "Running Tests with Coverage"

if npm test -- --coverage --watchAll=false --passWithNoTests 2>&1 | tee test-output.tmp; then
  # Check coverage (extract from output if possible)
  if grep -q "All files" test-output.tmp; then
    COVERAGE_LINE=$(grep "All files" test-output.tmp || echo "")
    echo "$COVERAGE_LINE"
    print_success "Tests passed with coverage"
  else
    print_success "Tests passed (coverage report not parsed)"
  fi
else
  print_error "Tests failed. Fix failing tests before deploying."
  rm -f test-output.tmp
  exit 1
fi

rm -f test-output.tmp

# Check 3: TypeScript type checking
print_step "3/6" "TypeScript Type Checking"

if npx tsc --noEmit 2>&1 | tee type-check-output.tmp; then
  print_success "No TypeScript errors found"
else
  ERROR_COUNT=$(grep -c "error TS" type-check-output.tmp || echo "0")
  print_error "Found $ERROR_COUNT TypeScript errors. Fix them before deploying."
  cat type-check-output.tmp
  rm -f type-check-output.tmp
  exit 1
fi

rm -f type-check-output.tmp

# Check 4: Lint checking
print_step "4/6" "ESLint Checking"

if npm run lint 2>&1 | tee lint-output.tmp; then
  # Check for warnings
  if grep -q "warning" lint-output.tmp; then
    WARNING_COUNT=$(grep -c "warning" lint-output.tmp || echo "0")
    print_warning "Found $WARNING_COUNT ESLint warnings (not blocking)"
  else
    print_success "No linting errors or warnings"
  fi
else
  print_error "Linting failed. Fix errors before deploying."
  cat lint-output.tmp
  rm -f lint-output.tmp
  exit 1
fi

rm -f lint-output.tmp

# Check 5: Security audit
print_step "5/6" "Security Audit (npm audit)"

if npm audit --audit-level=high 2>&1 | tee audit-output.tmp; then
  print_success "No high/critical security vulnerabilities found"
else
  VULN_COUNT=$(grep -c "vulnerabilit" audit-output.tmp || echo "0")
  if [ "$VULN_COUNT" -gt 0 ]; then
    print_error "Found security vulnerabilities. Run 'npm audit fix' or review manually."
    cat audit-output.tmp
    rm -f audit-output.tmp
    exit 1
  else
    print_success "Security audit passed"
  fi
fi

rm -f audit-output.tmp

# Check 6: Production build
print_step "6/6" "Production Build Test"

if npm run build 2>&1 | tee build-output.tmp; then
  # Check build output for size warnings
  if grep -q "First Load JS" build-output.tmp; then
    print_success "Production build succeeded"

    # Extract build stats if available
    echo -e "${BLUE}Build Stats:${NC}"
    grep -A 5 "Route (app)" build-output.tmp || echo "Stats not available"
    echo ""
  else
    print_success "Production build completed"
  fi
else
  print_error "Production build failed. Fix build errors before deploying."
  cat build-output.tmp
  rm -f build-output.tmp
  exit 1
fi

rm -f build-output.tmp

# Final summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Verification Summary          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ Checks Passed: $CHECKS_PASSED${NC}"
if [ $CHECKS_FAILED -gt 0 ]; then
  echo -e "${RED}❌ Checks Failed: $CHECKS_FAILED${NC}"
  echo ""
  echo -e "${RED}⚠️  Deployment BLOCKED - Fix errors above${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ READY FOR PRODUCTION DEPLOYMENT   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Review changes one final time"
echo -e "  2. Ensure environment variables are set in Vercel"
echo -e "  3. Run: ${GREEN}vercel --prod${NC}"
echo -e "  4. Monitor deployment logs"
echo ""

exit 0
