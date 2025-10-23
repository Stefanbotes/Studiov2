# Vercel Deployment Instructions

## Critical Environment Variable Configuration

### ⚠️ BEFORE DEPLOYING: Update NEXTAUTH_URL in Vercel

The redirect loop issue was caused by an incorrect `NEXTAUTH_URL` configuration. Follow these steps to fix it:

### Step 1: Get Your Vercel Deployment URL

1. Go to your Vercel dashboard
2. Select your project
3. Note your production URL (e.g., `https://your-app.vercel.app`)

### Step 2: Set NEXTAUTH_URL in Vercel

1. In your Vercel project, go to **Settings**
2. Click on **Environment Variables**
3. Find the `NEXTAUTH_URL` variable (or add a new one)
4. Set the value to your production URL:
   ```
   https://your-app.vercel.app
   ```
5. Make sure it's set for **Production** environment
6. Click **Save**

### Step 3: Verify Other Environment Variables

Ensure these are also set in Vercel:

#### Required Variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Your JWT encryption key
- `NEXTAUTH_URL` - Your production URL (from Step 2)

#### Optional Variables (if using AWS):
- `AWS_PROFILE`
- `AWS_REGION`
- `AWS_BUCKET_NAME`
- `AWS_FOLDER_PREFIX`

### Step 4: Deploy

1. Commit and push your code changes to GitHub
2. Vercel will automatically deploy
3. Or manually trigger a deployment from Vercel dashboard

### Step 5: Test the Deployment

After deployment completes:

1. **Visit the home page** (unauthenticated)
   - Should see the landing page
   - Should NOT redirect in a loop

2. **Test login flow**:
   - Click login
   - Enter credentials
   - Should redirect to `/dashboard`
   - Should NOT see redirect loop

3. **Test protected routes**:
   - Visit `/dashboard` directly (while authenticated)
   - Should see dashboard content
   - Should NOT redirect to login

4. **Check Vercel logs**:
   - Should NOT see repeated calls to `/api/auth/session`
   - Should NOT see calls to `/api/auth/error`
   - Should see clean authentication logs

## What Changed in This Fix

### ✅ Removed Middleware
- Deleted `middleware.ts` file
- This was causing competing redirects with server-side checks

### ✅ Simplified Authentication Flow
- Now relies only on server-side session checks
- Layouts handle route protection
- No edge runtime session conflicts

### ✅ Better Environment Variable Documentation
- Added clear warnings about `NEXTAUTH_URL`
- Explained the need for production URL configuration

## Troubleshooting

### If You Still See Redirect Loops:

1. **Clear browser cache and cookies**
2. **Verify NEXTAUTH_URL is correct** in Vercel environment variables
3. **Check Vercel deployment logs** for authentication errors
4. **Ensure the deployment picked up the latest code** (middleware should be gone)

### If Login Doesn't Work:

1. **Check DATABASE_URL** is accessible from Vercel
2. **Check NEXTAUTH_SECRET** is set
3. **Review Vercel function logs** for database connection errors

## Expected Log Output

### Successful Login:
```
🔍 Auth: Attempting login for email: user@example.com
✅ Database connection successful
✅ User found: user@example.com (ID: xxx)
✅ Authentication successful for user: user@example.com
🎫 JWT callback - Creating token for user: user@example.com
🔄 Session callback - Creating session with token
✅ Sign in event: user@example.com
🔀 Redirect callback: { url: '/dashboard', baseUrl: 'https://your-app.vercel.app' }
```

### Accessing Protected Route:
```
🔐 Dashboard Layout - Session check: { hasSession: true, userEmail: 'user@example.com', userId: 'xxx' }
✅ Session valid, rendering dashboard
```

## Support

If you continue to experience issues after following these steps:

1. Check the Vercel function logs for errors
2. Verify all environment variables are set correctly
3. Ensure the latest code is deployed (run `git log` to confirm middleware.ts is removed)
4. Try a hard refresh (Ctrl+Shift+R) to clear any cached redirects

---

**Last Updated**: October 23, 2025
**Status**: Ready for deployment
