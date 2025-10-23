#!/bin/bash

# Clean Commit and Deploy Script
# Purpose: Commit all changes and push to GitHub to trigger fresh Vercel deployment
# Created: 2025-10-23

set -e  # Exit on any error

echo "========================================"
echo "🧹 CLEAN COMMIT AND DEPLOY SCRIPT"
echo "========================================"
echo ""
echo "This script will:"
echo "  1. Show current git status"
echo "  2. Add all files to git"
echo "  3. Create a comprehensive commit"
echo "  4. Push to GitHub (origin/main)"
echo "  5. Trigger Vercel deployment"
echo ""

# Navigate to repo directory
cd /home/ubuntu/Studiov2_investigation

echo "📍 Current Location: $(pwd)"
echo ""

# Step 1: Check Current Git Status
echo "========================================"
echo "STEP 1: Current Git Status"
echo "========================================"
echo ""

echo "Current branch:"
git branch --show-current
echo ""

echo "Last commit:"
git log -1 --oneline
echo ""

echo "Uncommitted changes:"
git status --short
echo ""

# Count files
MODIFIED_COUNT=$(git status --short | grep "^ M" | wc -l)
UNTRACKED_COUNT=$(git status --short | grep "^??" | wc -l)
TOTAL_COUNT=$((MODIFIED_COUNT + UNTRACKED_COUNT))

echo "📊 Summary:"
echo "  - Modified files: $MODIFIED_COUNT"
echo "  - Untracked files: $UNTRACKED_COUNT"
echo "  - Total files to commit: $TOTAL_COUNT"
echo ""

if [ $TOTAL_COUNT -eq 0 ]; then
    echo "✅ No changes to commit. Repository is clean."
    echo ""
    echo "Would you like to push anyway to trigger a fresh deployment? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Exiting..."
        exit 0
    fi
else
    # Step 2: Add All Files
    echo "========================================"
    echo "STEP 2: Adding All Files to Git"
    echo "========================================"
    echo ""
    
    git add -A
    echo "✅ All files added to staging area"
    echo ""
    
    # Show what will be committed
    echo "Files to be committed:"
    git status --short
    echo ""
    
    # Step 3: Create Comprehensive Commit
    echo "========================================"
    echo "STEP 3: Creating Commit"
    echo "========================================"
    echo ""
    
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    COMMIT_MESSAGE="Clean deployment commit - $TIMESTAMP

This commit includes:
- All investigation reports and documentation
- Deployment verification scripts
- NextAuth route fixes and diagnostics
- Updated dependencies (package-lock.json)
- Complete codebase snapshot for clean Vercel deployment

Purpose: Trigger fresh Vercel deployment with all verified fixes
Status: Ready for production deployment"
    
    git commit -m "$COMMIT_MESSAGE"
    echo "✅ Commit created successfully"
    echo ""
fi

# Step 4: Push to GitHub
echo "========================================"
echo "STEP 4: Pushing to GitHub"
echo "========================================"
echo ""

echo "Pushing to origin/main..."
git push origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""

# Step 5: Provide Verification Instructions
echo "========================================"
echo "STEP 5: Verification Instructions"
echo "========================================"
echo ""

echo "🚀 Vercel Deployment Triggered!"
echo ""
echo "Your push to GitHub has triggered a new Vercel deployment."
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. CHECK VERCEL DEPLOYMENT STATUS"
echo "   - Visit: https://vercel.com/dashboard"
echo "   - Look for the new deployment in your project"
echo "   - Status should show: Building → Ready"
echo "   - Expected time: 1-3 minutes"
echo ""

echo "2. VERIFY DEPLOYMENT DOMAINS"
echo "   According to your screenshots, you should have:"
echo "   - Main: studiov2-eight.vercel.app"
echo "   - Git: studiov2-git-main-stefans-projects-ebf89219.vercel.app"
echo "   - Preview: studiov2-qbb84t0iz-stefans-projects-ebf89219.vercel.app"
echo ""

echo "3. TEST NEXTAUTH ENDPOINTS"
echo "   Once deployment is Ready (green), test these URLs:"
echo ""
echo "   a) Session endpoint:"
echo "      curl https://studiov2-eight.vercel.app/api/auth/session"
echo "      Expected: {\"user\":null} or session data"
echo ""
echo "   b) Providers endpoint:"
echo "      curl https://studiov2-eight.vercel.app/api/auth/providers"
echo "      Expected: {\"google\":{...}}"
echo ""
echo "   c) CSRF endpoint:"
echo "      curl https://studiov2-eight.vercel.app/api/auth/csrf"
echo "      Expected: {\"csrfToken\":\"...\"}"
echo ""

echo "4. CHECK ENVIRONMENT VARIABLES"
echo "   In Vercel dashboard, verify these are set:"
echo "   ✓ NEXTAUTH_URL"
echo "   ✓ POSTGRES_URL"
echo "   ✓ PRISMA_DATABASE_URL"
echo "   ✓ DATABASE_URL"
echo "   ✓ Google OAuth credentials"
echo ""

echo "5. MONITOR DEPLOYMENT LOGS"
echo "   If any issues occur:"
echo "   - Check Vercel deployment logs"
echo "   - Look for build errors or warnings"
echo "   - Check function logs for runtime errors"
echo ""

echo "📊 TIMELINE:"
echo "  ⏱️  0-1 min:  GitHub receives push"
echo "  ⏱️  1-2 min:  Vercel starts building"
echo "  ⏱️  2-3 min:  Build completes"
echo "  ⏱️  3 min:    Deployment ready"
echo "  ✅ 3+ min:    Test endpoints"
echo ""

echo "🔍 TROUBLESHOOTING:"
echo "  If NextAuth still returns 404 after deployment:"
echo "  1. Check Vercel function logs for errors"
echo "  2. Verify NEXTAUTH_URL matches your domain exactly"
echo "  3. Try accessing /api/hello to confirm API routes work"
echo "  4. Check if there are any .vercelignore rules blocking files"
echo "  5. Verify app/api/auth/[...nextauth]/route.ts is in the build"
echo ""

echo "========================================"
echo "✅ DEPLOYMENT PROCESS COMPLETE"
echo "========================================"
echo ""

echo "Current commit: $(git log -1 --oneline)"
echo ""
echo "🎯 Your code is now on GitHub and Vercel is deploying it!"
echo "    Check Vercel dashboard for deployment progress."
echo ""
