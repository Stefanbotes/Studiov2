# ⚠️ CRITICAL: NEXTAUTH_URL Configuration for Vercel

## The Issue

The current `.env` file has:
```
NEXTAUTH_URL="http://localhost:3000"
```

**This MUST be changed to your actual Vercel deployment URL for authentication to work correctly.**

## How to Fix This on Vercel

### Step 1: Get Your Vercel Deployment URL

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your Studio 2 project
3. Copy your deployment URL (e.g., `https://studiov2-xyz123.vercel.app`)

### Step 2: Update Environment Variables in Vercel

1. In your Vercel project dashboard, click on **Settings**
2. Click on **Environment Variables** in the left sidebar
3. Find the `NEXTAUTH_URL` variable (or create it if it doesn't exist)
4. Update/Set the value to your full Vercel URL:
   ```
   https://your-actual-vercel-url.vercel.app
   ```
5. Make sure to apply it to **Production**, **Preview**, and **Development** environments
6. Click **Save**

### Step 3: Redeploy

After updating the environment variable, you MUST redeploy:

1. Go to your project's **Deployments** tab
2. Click on the three dots (**...**) next to the latest deployment
3. Click **Redeploy**
4. Or, simply push a new commit to trigger a deployment

## Important Notes

### For Production
```bash
NEXTAUTH_URL="https://your-actual-domain.vercel.app"
```

### For Custom Domains
If you've set up a custom domain:
```bash
NEXTAUTH_URL="https://yourdomain.com"
```

### Why This Matters

NextAuth uses `NEXTAUTH_URL` to:
- Set cookie domains correctly
- Generate callback URLs
- Validate redirect URLs
- Create session tokens

If this URL doesn't match your actual deployment URL:
- **Sessions won't be created properly** ❌
- **Cookies won't be set correctly** ❌
- **Redirects will fail** ❌
- **Authentication will loop** ❌

## Verification

After setting the correct URL and redeploying, test the authentication:

1. Go to your Vercel deployment URL
2. Try to log in with test credentials
3. You should be redirected to `/dashboard` successfully
4. Check the browser console for logs (if debug mode is on)
5. Check Vercel logs for server-side authentication logs

## Common Mistakes to Avoid

❌ **Don't use `localhost` in production**
❌ **Don't forget the `https://` protocol**
❌ **Don't include trailing slashes**
❌ **Don't forget to redeploy after changing env vars**

✅ **Use the full Vercel URL with https://**
✅ **Match the exact domain your app is deployed on**
✅ **Redeploy after every env var change**

## Quick Checklist

- [ ] Get Vercel deployment URL
- [ ] Update `NEXTAUTH_URL` in Vercel environment variables
- [ ] Apply to all environments (Production, Preview, Development)
- [ ] Redeploy the application
- [ ] Test authentication
- [ ] Verify successful login and redirect to dashboard

---

**After completing these steps, the authentication redirect loop should be fixed! 🎉**
