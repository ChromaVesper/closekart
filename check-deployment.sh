#!/bin/bash
# Production Deployment Verification Script
# Run this script to verify all components are ready for deployment

echo "=========================================="
echo "CloseKart Production Deployment Checker"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for checks
PASSED=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAILED++))
    fi
}

# Function to check environment variable
check_env_var() {
    if grep -q "^$1=" "$2" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Environment variable $1 found in $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Environment variable $1 missing in $2"
        ((FAILED++))
    fi
}

echo "Checking Backend Configuration..."
echo "-----------------------------------"
check_file "backend/.env"
check_file "backend/.env.production"
check_file "backend/package.json"
check_file "backend/server.js"
check_file "backend/render.yaml"

check_env_var "MONGO_URI" "backend/.env.production"
check_env_var "JWT_SECRET" "backend/.env.production"
check_env_var "FRONTEND_URL" "backend/.env.production"

echo ""
echo "Checking Frontend Configuration..."
echo "-----------------------------------"
check_file "frontend/.env"
check_file "frontend/.env.production"
check_file "frontend/package.json"
check_file "frontend/vite.config.js"
check_file "frontend/netlify.toml"

check_env_var "VITE_API_URL" "frontend/.env.production"

echo ""
echo "Checking Build Output..."
echo "-----------------------------------"
if [ -d "frontend/dist" ]; then
    if [ -f "frontend/dist/index.html" ]; then
        echo -e "${GREEN}✓${NC} Frontend build exists: frontend/dist/"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Build incomplete: index.html missing"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Build directory missing: frontend/dist/"
    ((FAILED++))
fi

echo ""
echo "Checking Deployment Configuration..."
echo "-----------------------------------"
check_file "vercel.json"

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed! Ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. Please fix issues before deploying.${NC}"
    exit 1
fi
