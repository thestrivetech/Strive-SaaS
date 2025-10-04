#!/bin/bash

# Database Test Runner
# Loads environment variables and executes test scripts
# Usage:
#   ./scripts/run-tests.sh <test-file>           # Run specific test
#   ./scripts/run-tests.sh all                   # Run all tests
#   ./scripts/run-tests.sh notifications         # Run notification tests
#   ./scripts/run-tests.sh realtime              # Run realtime tests
#   ./scripts/run-tests.sh storage               # Run storage tests
#   ./scripts/run-tests.sh rls                   # Run RLS tests
#   ./scripts/run-tests.sh verify                # Run verification

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Database Test Runner${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# Load environment variables
echo -e "${YELLOW}📝 Loading environment variables...${NC}"
set -a
source .env
set +a
echo -e "${GREEN}✅ Environment variables loaded${NC}\n"

# Verify required env vars
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not set${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ Error: NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Required environment variables verified${NC}\n"

# Define test files
TESTS_DIR="scripts"
TEST_NOTIFICATIONS="$TESTS_DIR/test-notifications.ts"
TEST_REALTIME="$TESTS_DIR/test-realtime.ts"
TEST_STORAGE="$TESTS_DIR/test-storage.ts"
TEST_RLS="$TESTS_DIR/test-rls.ts"
TEST_VERIFY="$TESTS_DIR/verify-database-config.ts"

# Function to run a test
run_test() {
    local test_file=$1
    local test_name=$2

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    if npx tsx "$test_file"; then
        echo -e "\n${GREEN}✅ ${test_name} PASSED${NC}\n"
        return 0
    else
        echo -e "\n${RED}❌ ${test_name} FAILED${NC}\n"
        return 1
    fi
}

# Parse arguments
case "${1:-help}" in
    all)
        echo -e "${BLUE}🚀 Running all tests...${NC}\n"
        FAILED=0

        run_test "$TEST_VERIFY" "Database Verification" || FAILED=$((FAILED + 1))
        run_test "$TEST_NOTIFICATIONS" "Notification Tests" || FAILED=$((FAILED + 1))
        run_test "$TEST_REALTIME" "Realtime Tests" || FAILED=$((FAILED + 1))
        run_test "$TEST_STORAGE" "Storage Tests" || FAILED=$((FAILED + 1))
        run_test "$TEST_RLS" "RLS Tests" || FAILED=$((FAILED + 1))

        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        if [ $FAILED -eq 0 ]; then
            echo -e "${GREEN}✅ All tests passed!${NC}"
        else
            echo -e "${RED}❌ $FAILED test(s) failed${NC}"
            exit 1
        fi
        ;;

    notifications)
        run_test "$TEST_NOTIFICATIONS" "Notification Tests"
        ;;

    realtime)
        run_test "$TEST_REALTIME" "Realtime Tests"
        ;;

    storage)
        run_test "$TEST_STORAGE" "Storage Tests"
        ;;

    rls)
        run_test "$TEST_RLS" "RLS Tests"
        ;;

    verify)
        run_test "$TEST_VERIFY" "Database Verification"
        ;;

    help)
        echo "Usage: ./scripts/run-tests.sh [command]"
        echo ""
        echo "Commands:"
        echo "  all              Run all tests"
        echo "  notifications    Run notification tests"
        echo "  realtime         Run realtime subscription tests"
        echo "  storage          Run storage bucket tests"
        echo "  rls              Run RLS isolation tests"
        echo "  verify           Run database verification"
        echo "  help             Show this help message"
        echo ""
        echo "Example:"
        echo "  ./scripts/run-tests.sh all"
        echo "  ./scripts/run-tests.sh notifications"
        ;;

    *)
        # If argument looks like a file path, run it directly
        if [ -f "$1" ]; then
            run_test "$1" "$(basename $1)"
        else
            echo -e "${RED}❌ Unknown command or file not found: $1${NC}"
            echo "Run './scripts/run-tests.sh help' for usage"
            exit 1
        fi
        ;;
esac
