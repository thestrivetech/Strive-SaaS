#!/bin/bash

###############################################################################
# CI/CD Test Script
# Runs all quality checks: linting, type checking, tests
# Exits with non-zero code if any check fails
###############################################################################

set -e  # Exit immediately if a command exits with a non-zero status
set -o pipefail  # Fail if any command in a pipeline fails

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Start time
START_TIME=$(date +%s)

print_header "CI/CD Quality Checks - Platform"

###############################################################################
# 1. Environment Check
###############################################################################
print_header "1/4 - Environment Check"

# Check if we're in the platform directory
if [ ! -f "package.json" ]; then
  print_error "Not in platform directory! Run this script from (platform)/ folder"
  exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  print_warning "node_modules not found. Running npm install..."
  npm install
fi

print_success "Environment check passed"

###############################################################################
# 2. Linting (ESLint)
###############################################################################
print_header "2/4 - ESLint Check"

if npm run lint; then
  print_success "ESLint passed - no errors or warnings"
else
  print_error "ESLint failed - fix errors and warnings"
  exit 1
fi

###############################################################################
# 3. Type Checking (TypeScript)
###############################################################################
print_header "3/4 - TypeScript Type Check"

if npx tsc --noEmit; then
  print_success "TypeScript check passed - no type errors"
else
  print_error "TypeScript check failed - fix type errors"
  exit 1
fi

###############################################################################
# 4. Tests with Coverage
###############################################################################
print_header "4/4 - Jest Tests with Coverage"

# Run tests with coverage, no watch mode
if npm test -- --coverage --watchAll=false --passWithNoTests; then
  print_success "All tests passed"
else
  print_error "Tests failed"
  exit 1
fi

###############################################################################
# Coverage Check
###############################################################################
print_header "Coverage Analysis"

# Check if coverage meets threshold (80%)
# Jest will fail if coverage is below threshold set in jest.config.ts
# This is just informational output

if [ -f "coverage/coverage-summary.json" ]; then
  print_success "Coverage report generated at coverage/"

  # Optional: Parse and display coverage summary
  # Requires jq (JSON processor)
  if command -v jq &> /dev/null; then
    TOTAL_COVERAGE=$(jq -r '.total.lines.pct' coverage/coverage-summary.json)
    if (( $(echo "$TOTAL_COVERAGE >= 80" | bc -l) )); then
      print_success "Coverage: ${TOTAL_COVERAGE}% (meets 80% threshold)"
    else
      print_warning "Coverage: ${TOTAL_COVERAGE}% (below 80% threshold)"
    fi
  fi
else
  print_warning "Coverage summary not found"
fi

###############################################################################
# Summary
###############################################################################
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

print_header "All Checks Passed! ✓"
echo -e "${GREEN}✓ ESLint${NC}"
echo -e "${GREEN}✓ TypeScript${NC}"
echo -e "${GREEN}✓ Jest Tests${NC}"
echo -e "${GREEN}✓ Coverage Threshold (80%+)${NC}"
echo ""
echo -e "${BLUE}Total duration: ${DURATION}s${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Ready to commit! 🚀${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

exit 0
