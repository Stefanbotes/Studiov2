#!/bin/bash

# Deployment Trigger Script for Vercel
# This script helps trigger a new deployment when automatic deployment fails

echo "==========================================="
echo "Vercel Deployment Trigger Script"
echo "==========================================="
echo ""

# Check current commit
echo "📍 Current commit on main branch:"
git log -1 --oneline

echo ""
echo "📍 Current commit on origin/main:"
git log origin/main -1 --oneline

echo ""
echo "==========================================="
echo "Deployment Options:"
echo "==========================================="
echo ""
echo "1. 🔄 Make a trivial change and push (recommended)"
echo "2. 📋 Show Vercel deployment instructions"
echo "3. ❌ Cancel"
echo ""

read -p "Select option (1-3): " option

case $option in
  1)
    echo ""
    echo "🚀 Triggering deployment..."
    echo "# Deployment trigger - $(date)" >> .deployment_trigger
    git add .deployment_trigger
    git commit -m "chore: trigger Vercel deployment"
    
    echo ""
    echo "📤 Pushing to origin/main..."
    git push origin main
    
    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ Successfully pushed! Vercel should start deploying automatically."
      echo ""
      echo "📊 Monitor deployment at: https://vercel.com/dashboard"
      echo ""
      echo "🔍 After deployment completes, verify with:"
      echo "curl -I https://studiov2-eight.vercel.app/api/auth/session"
      echo ""
      echo "Expected: HTTP/2 200 + content-type: application/json"
    else
      echo ""
      echo "❌ Push failed. Check the error message above."
      echo ""
      echo "Common issues:"
      echo "- Large files (>100MB) in the repository"
      echo "- Git authentication problems"
      echo "- Network connectivity issues"
    fi
    ;;
    
  2)
    echo ""
    echo "==========================================="
    echo "Manual Deployment Instructions"
    echo "==========================================="
    echo ""
    echo "Since the fix is already committed and pushed to origin/main,"
    echo "you just need to trigger a Vercel deployment:"
    echo ""
    echo "📋 Steps:"
    echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
    echo "2. Select your project: Studiov2"
    echo "3. Click on 'Deployments' tab"
    echo "4. Find the latest commit (8bc9ab0 or later)"
    echo "5. Click 'Redeploy' or 'Deploy'"
    echo ""
    echo "🔍 Alternatively:"
    echo "- Go to project Settings → Git"
    echo "- Verify Git integration is active"
    echo "- Check if there are any deployment errors in logs"
    echo ""
    ;;
    
  3)
    echo ""
    echo "❌ Cancelled."
    echo ""
    ;;
    
  *)
    echo ""
    echo "❌ Invalid option."
    echo ""
    ;;
esac

echo "==========================================="
