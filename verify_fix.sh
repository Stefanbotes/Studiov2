#!/bin/bash

# Verification script for NextAuth session endpoint fix
# Run this after Vercel deployment completes

echo "======================================"
echo "NextAuth Endpoint Verification"
echo "======================================"
echo ""

BASE_URL="https://studiov2-eight.vercel.app"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Testing NextAuth endpoints..."
echo ""

# Test 1: Session endpoint
echo "1. Testing /api/auth/session"
response=$(curl -s -o /dev/null -w "%{http_code}|%{content_type}" "$BASE_URL/api/auth/session")
status_code=$(echo $response | cut -d'|' -f1)
content_type=$(echo $response | cut -d'|' -f2)

if [ "$status_code" = "200" ] && [[ "$content_type" =~ "application/json" ]]; then
    echo -e "   ${GREEN}✅ PASS${NC} - Status: $status_code, Content-Type: $content_type"
else
    echo -e "   ${RED}❌ FAIL${NC} - Status: $status_code, Content-Type: $content_type"
    echo -e "   ${YELLOW}Expected: 200 with application/json${NC}"
fi
echo ""

# Test 2: Providers endpoint
echo "2. Testing /api/auth/providers"
response=$(curl -s -o /dev/null -w "%{http_code}|%{content_type}" "$BASE_URL/api/auth/providers")
status_code=$(echo $response | cut -d'|' -f1)
content_type=$(echo $response | cut -d'|' -f2)

if [ "$status_code" = "200" ] && [[ "$content_type" =~ "application/json" ]]; then
    echo -e "   ${GREEN}✅ PASS${NC} - Status: $status_code, Content-Type: $content_type"
else
    echo -e "   ${RED}❌ FAIL${NC} - Status: $status_code, Content-Type: $content_type"
    echo -e "   ${YELLOW}Expected: 200 with application/json${NC}"
fi
echo ""

# Test 3: CSRF endpoint
echo "3. Testing /api/auth/csrf"
response=$(curl -s -o /dev/null -w "%{http_code}|%{content_type}" "$BASE_URL/api/auth/csrf")
status_code=$(echo $response | cut -d'|' -f1)
content_type=$(echo $response | cut -d'|' -f2)

if [ "$status_code" = "200" ] && [[ "$content_type" =~ "application/json" ]]; then
    echo -e "   ${GREEN}✅ PASS${NC} - Status: $status_code, Content-Type: $content_type"
else
    echo -e "   ${RED}❌ FAIL${NC} - Status: $status_code, Content-Type: $content_type"
    echo -e "   ${YELLOW}Expected: 200 with application/json${NC}"
fi
echo ""

# Test 4: Check for HTML responses (indicates rewrite issue)
echo "4. Checking for HTML responses (should be JSON)"
session_content=$(curl -s "$BASE_URL/api/auth/session" | head -c 100)
if [[ "$session_content" =~ "<html" ]] || [[ "$session_content" =~ "<!DOCTYPE" ]]; then
    echo -e "   ${RED}❌ FAIL${NC} - Receiving HTML instead of JSON"
    echo -e "   ${YELLOW}This indicates the rewrite rule is still active${NC}"
else
    echo -e "   ${GREEN}✅ PASS${NC} - Receiving JSON response (not HTML)"
fi
echo ""

# Test 5: Check deployment age
echo "5. Checking deployment freshness"
age_header=$(curl -s -I "$BASE_URL/api/auth/session" | grep -i "^age:" | cut -d' ' -f2 | tr -d '\r')
if [ -z "$age_header" ]; then
    echo -e "   ${YELLOW}⚠️  WARN${NC} - No age header found"
elif [ "$age_header" -lt 300 ]; then
    echo -e "   ${GREEN}✅ PASS${NC} - Deployment is fresh (age: ${age_header}s)"
else
    echo -e "   ${YELLOW}⚠️  WARN${NC} - Deployment might be cached (age: ${age_header}s)"
    echo -e "   ${YELLOW}Consider waiting a few minutes or clearing Vercel cache${NC}"
fi
echo ""

# Final summary
echo "======================================"
echo "Verification Complete"
echo "======================================"
echo ""
echo "If all tests pass, the fix is deployed successfully!"
echo "If tests fail, wait 2-3 minutes for deployment and run again."
echo ""
echo "To check deployment status:"
echo "  https://vercel.com/stefans-projects-ebf89219/studiov2/deployments"
echo ""
