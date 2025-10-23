#!/bin/bash

# ============================================================================
# Force Deployment Script - Vercel NextAuth Route Fix
# ============================================================================
#
# Purpose: Force a new Vercel deployment to ensure NextAuth route is deployed
# Date: October 23, 2025
# Issue: NextAuth routes returning 404 due to deployment state issue
#
# Usage:
#   ./force_deployment.sh
#
# This script will:
# 1. Add a deployment verification comment to the NextAuth route
# 2. Commit the change
# 3. Push to GitHub (which triggers Vercel deployment)
# ============================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                   Force Deployment - NextAuth Route Fix                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "app/api/auth/[...nextauth]/route.ts" ]; then
    echo -e "${RED}❌ ERROR: NextAuth route file not found!${NC}"
    echo "Please run this script from the Studiov2_investigation directory."
    exit 1
fi

echo -e "${BLUE}📋 Current status:${NC}"
echo "Repository: $(git remote get-url origin)"
echo "Branch: $(git branch --show-current)"
echo "Last commit: $(git log -1 --oneline)"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    git status --short
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted by user${NC}"
        exit 1
    fi
fi

# Create deployment marker comment
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
MARKER_COMMENT="// Deployment verification: $TIMESTAMP - Ensuring NextAuth route is deployed"

echo -e "${BLUE}📝 Adding deployment marker to NextAuth route...${NC}"

# Add marker comment to the route file (at the end, before the last line)
ROUTE_FILE="app/api/auth/[...nextauth]/route.ts"

# Backup the file
cp "$ROUTE_FILE" "${ROUTE_FILE}.bak"

# Add the comment
echo "" >> "$ROUTE_FILE"
echo "$MARKER_COMMENT" >> "$ROUTE_FILE"

echo -e "${GREEN}✅ Marker added${NC}"
echo ""

# Show the change
echo -e "${BLUE}📋 Change preview:${NC}"
git diff "$ROUTE_FILE"
echo ""

# Confirm before proceeding
read -p "Commit and push this change? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Rolling back changes...${NC}"
    mv "${ROUTE_FILE}.bak" "$ROUTE_FILE"
    echo -e "${RED}❌ Aborted by user${NC}"
    exit 1
fi

# Remove backup
rm -f "${ROUTE_FILE}.bak"

# Commit the change
echo -e "${BLUE}📦 Committing change...${NC}"
git add "$ROUTE_FILE"
git commit -m "fix: force deployment to ensure NextAuth route is deployed

- Add deployment verification marker
- Timestamp: $TIMESTAMP
- Purpose: Resolve 404 errors on all NextAuth endpoints
- See: NEXTAUTH_ROUTE_DIAGNOSTIC.md for full analysis"

echo -e "${GREEN}✅ Commit created${NC}"
echo ""

# Push to GitHub
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push successful!${NC}"
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════════╗"
    echo "║                          Deployment Triggered                              ║"
    echo "╚════════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo ""
    echo "1. 🔍 Monitor Vercel deployment:"
    echo "   → Go to: https://vercel.com/dashboard"
    echo "   → Click on: Studiov2 project"
    echo "   → Watch the deployment progress"
    echo ""
    echo "2. 📊 Check build logs:"
    echo "   → Look for: 'Compiling app/api/auth/[...nextauth]/route.ts'"
    echo "   → Verify: No errors in the build"
    echo ""
    echo "3. ⏰ Wait for deployment (usually 2-3 minutes)"
    echo ""
    echo "4. 🧪 Test the endpoints:"
    echo "   → Run: node test_nextauth_endpoints.js"
    echo "   → Expected: All endpoints return 200"
    echo ""
    echo -e "${YELLOW}⏳ Estimated deployment time: 2-3 minutes${NC}"
    echo ""
    echo "Run this command in 3 minutes to verify:"
    echo -e "${BLUE}node test_nextauth_endpoints.js https://studiov2-eight.vercel.app${NC}"
else
    echo -e "${RED}❌ Push failed!${NC}"
    echo "Please check your network connection and Git permissions."
    exit 1
fi
