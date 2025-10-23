#!/bin/bash

# Authentication Fix Deployment Script
# This script merges the authentication fixes to main and deploys to production

set -e  # Exit on any error

echo "=========================================="
echo "🚀 Authentication Fix Deployment Script"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to repository
cd /home/ubuntu/Studiov2_investigation

echo -e "${BLUE}📍 Current Location:${NC}"
pwd
echo ""

# Show current branch
echo -e "${BLUE}📊 Current Branch:${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "  $CURRENT_BRANCH"
echo ""

# Show fix branch status
echo -e "${BLUE}✅ Fix Branch Status:${NC}"
echo "  Branch: deployment-fix-verified"
git log deployment-fix-verified -1 --oneline
echo ""

# Show main branch status
echo -e "${BLUE}📦 Main Branch Status (Current Production):${NC}"
echo "  Branch: main"
git log main -1 --oneline
echo ""

# Check if there are uncommitted changes
echo -e "${BLUE}🔍 Checking for uncommitted changes...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes:${NC}"
    git status -s
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ No blocking issues found${NC}"
echo ""

# Confirm with user
echo -e "${YELLOW}⚠️  This will:${NC}"
echo "  1. Switch to main branch"
echo "  2. Merge deployment-fix-verified into main"
echo "  3. Push to GitHub (triggering Vercel deployment)"
echo ""
read -p "Are you sure you want to proceed? (yes/no) " -r
echo ""
if [[ ! $REPLY == "yes" ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "🚀 Starting Deployment Process"
echo "=========================================="
echo ""

# Step 1: Switch to main branch
echo -e "${BLUE}📌 Step 1: Switching to main branch...${NC}"
git checkout main
echo -e "${GREEN}✅ Switched to main${NC}"
echo ""

# Step 2: Pull latest changes from main
echo -e "${BLUE}📥 Step 2: Pulling latest changes from main...${NC}"
git pull origin main || echo "Already up to date"
echo -e "${GREEN}✅ Main branch updated${NC}"
echo ""

# Step 3: Merge the fix branch
echo -e "${BLUE}🔀 Step 3: Merging deployment-fix-verified into main...${NC}"
if git merge deployment-fix-verified -m "chore: deploy authentication fixes to production"; then
    echo -e "${GREEN}✅ Merge successful${NC}"
else
    echo -e "${RED}❌ Merge failed - resolve conflicts manually${NC}"
    exit 1
fi
echo ""

# Step 4: Show the new commit
echo -e "${BLUE}📝 Step 4: New commit created:${NC}"
git log -1 --oneline
echo ""

# Step 5: Push to GitHub
echo -e "${BLUE}📤 Step 5: Pushing to GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Push successful - Vercel deployment triggered${NC}"
else
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
fi
echo ""

echo "=========================================="
echo "✅ Deployment Process Complete"
echo "=========================================="
echo ""

echo -e "${GREEN}🎉 Success! The authentication fixes have been deployed.${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. ${BLUE}Monitor Vercel Deployment:${NC}"
echo "   • Go to: https://vercel.com/stefanbotes-projects/studiov2"
echo "   • Wait 2-3 minutes for deployment to complete"
echo "   • Verify the deployment is from 'main' branch"
echo "   • Check the commit includes the merge we just made"
echo ""
echo "2. ${BLUE}Purge Vercel Cache (CRITICAL):${NC}"
echo "   • Go to: https://vercel.com/stefanbotes-projects/studiov2/settings/data-cache"
echo "   • Click 'Purge Everything'"
echo "   • This ensures CDN serves the new code with no-cache headers"
echo ""
echo "3. ${BLUE}Test Authentication:${NC}"
echo "   • Open incognito/private browser window"
echo "   • Navigate to: https://studiov2-eight.vercel.app/dashboard"
echo "   • Should redirect to login"
echo "   • Login with valid credentials"
echo "   • Should successfully reach dashboard"
echo "   • Check Network tab: /api/auth/session should return 200 (not 404)"
echo ""
echo "4. ${BLUE}Verify Response Headers:${NC}"
echo "   • In Network tab, check /api/auth/session response"
echo "   • Should include: Cache-Control: no-store, no-cache, must-revalidate"
echo ""
echo -e "${GREEN}✨ If all tests pass, the authentication issue is RESOLVED!${NC}"
echo ""
echo "=========================================="
echo "📊 Deployment Summary"
echo "=========================================="
echo ""
echo "Repository: Studiov2_investigation"
echo "Branch Merged: deployment-fix-verified → main"
echo "Deployment Target: Vercel (studiov2-eight.vercel.app)"
echo "Timestamp: $(date)"
echo ""
echo "Changes Deployed:"
echo "  ✅ vercel.json - No-cache headers for /api/auth/*"
echo "  ✅ app/dashboard/page.tsx - Dynamic rendering"
echo "  ✅ app/dashboard/layout.tsx - Dynamic rendering"
echo "  ✅ app/auth/login/page.tsx - Improved redirect flow"
echo ""
echo "=========================================="
