#!/bin/bash

# UberFix Load Testing Script
# Run comprehensive load tests with different scenarios

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== UberFix Load Testing Suite ===${NC}\n"

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo -e "${RED}Error: Deno is not installed${NC}"
    echo "Install from: https://deno.land/"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
SUPABASE_URL=${VITE_SUPABASE_URL:-"https://zrrffsjbfkphridqyais.supabase.co"}
SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-""}

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}Error: SUPABASE_ANON_KEY not found${NC}"
    exit 1
fi

# Test scenarios
run_light_test() {
    echo -e "${YELLOW}Running Light Load Test (50 users, 30s)${NC}"
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    CONCURRENT_USERS=50 \
    TEST_DURATION=30 \
    deno run --allow-net --allow-env scripts/load-test.ts
}

run_medium_test() {
    echo -e "${YELLOW}Running Medium Load Test (100 users, 60s)${NC}"
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    CONCURRENT_USERS=100 \
    TEST_DURATION=60 \
    deno run --allow-net --allow-env scripts/load-test.ts
}

run_heavy_test() {
    echo -e "${YELLOW}Running Heavy Load Test (200 users, 120s)${NC}"
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    CONCURRENT_USERS=200 \
    TEST_DURATION=120 \
    deno run --allow-net --allow-env scripts/load-test.ts
}

run_stress_test() {
    echo -e "${YELLOW}Running Stress Test (500 users, 180s)${NC}"
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    CONCURRENT_USERS=500 \
    TEST_DURATION=180 \
    deno run --allow-net --allow-env scripts/load-test.ts
}

run_spike_test() {
    echo -e "${YELLOW}Running Spike Test (1000 users, 60s)${NC}"
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    CONCURRENT_USERS=1000 \
    TEST_DURATION=60 \
    deno run --allow-net --allow-env scripts/load-test.ts
}

# Menu
echo "Select test scenario:"
echo "1. Light Load (50 users, 30s)"
echo "2. Medium Load (100 users, 60s)"
echo "3. Heavy Load (200 users, 120s)"
echo "4. Stress Test (500 users, 180s)"
echo "5. Spike Test (1000 users, 60s)"
echo "6. Run All Tests"
echo "7. Custom Test"
echo ""
read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        run_light_test
        ;;
    2)
        run_medium_test
        ;;
    3)
        run_heavy_test
        ;;
    4)
        run_stress_test
        ;;
    5)
        run_spike_test
        ;;
    6)
        echo -e "${GREEN}Running all tests sequentially...${NC}\n"
        run_light_test
        sleep 10
        run_medium_test
        sleep 10
        run_heavy_test
        sleep 10
        run_stress_test
        ;;
    7)
        read -p "Enter concurrent users: " users
        read -p "Enter duration (seconds): " duration
        echo -e "${YELLOW}Running Custom Test ($users users, ${duration}s)${NC}"
        SUPABASE_URL=$SUPABASE_URL \
        SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
        CONCURRENT_USERS=$users \
        TEST_DURATION=$duration \
        deno run --allow-net --allow-env scripts/load-test.ts
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Load testing completed!${NC}"
