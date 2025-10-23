#!/bin/bash

# ============================================================================
# APPLY VERCEL.JSON FIX
# ============================================================================
# This script fixes the destructive rewrite rule in vercel.json that was
# causing ALL requests (including API routes) to be rewritten to "/"
# ============================================================================

set -e

echo "🔧 Applying vercel.json fix..."
echo ""

# Backup the current vercel.json
echo "📦 Creating backup of current vercel.json..."
cp vercel.json vercel.json.backup
echo "✅ Backup saved to vercel.json.backup"
echo ""

# Apply the fix
echo "🔨 Applying corrected configuration..."
cp vercel.json.fixed vercel.json
echo "✅ vercel.json has been updated"
echo ""

# Show the diff
echo "📝 Changes made:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "REMOVED: Destructive rewrite rule"
echo "  \"rewrites\": ["
echo "    {"
echo "      \"source\": \"/(.*)\","
echo "      \"destination\": \"/\""
echo "    }"
echo "  ]"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Commit the changes
echo "📝 Committing changes to git..."
git add vercel.json
git commit -m "fix: Remove destructive rewrite rule from vercel.json

CRITICAL FIX: The rewrite rule 'source: /(.*), destination: /' was
capturing ALL requests including API routes and rewriting them to '/',
causing NextAuth to receive HTML instead of JSON (CLIENT_FETCH_ERROR).

This fix removes the destructive rewrite rule, allowing Next.js routing
and middleware to function correctly.

Closes: Middleware investigation - root cause identified in vercel.json
"

echo "✅ Changes committed"
echo ""

echo "🚀 Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Push changes to GitHub:"
echo "   git push origin deployment-fix-verified"
echo ""
echo "2. Verify deployment succeeds on Vercel"
echo ""
echo "3. Test API routes:"
echo "   curl -I https://studiov2-eight.vercel.app/api/auth/session"
echo "   # Should return: content-type: application/json"
echo ""
echo "4. Test authentication in the app"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Fix applied successfully!"
