# NextAuth Redirect Loop - Debugging Guide

## 🎯 What We Added

We've added comprehensive error logging and debugging capabilities to help diagnose the NextAuth redirect loop issue. All changes have been committed and pushed to the `deployment-fix-verified` branch.

---

## 📋 Changes Made

### 1. Enhanced NextAuth Configuration (`lib/auth.ts`)
- ✅ Added detailed logging to all callbacks (signIn, jwt, session, redirect)
- ✅ Added timestamps to all log entries
- ✅ Enhanced error handling with full stack traces
- ✅ Temporarily enabled debug mode in production
- ✅ Created custom error page route

### 2. Created Auth Error Page (`app/auth/error/page.tsx`)
- ✅ Displays user-friendly error messages
- ✅ Logs detailed error information to browser console
- ✅ Shows error codes and timestamps
- ✅ Special handling for Configuration and Callback errors

### 3. Created Debug Endpoint (`app/api/debug/auth/route.ts`)
- ✅ Safe for production (no secrets exposed)
- ✅ Shows current session state
- ✅ Validates environment variables (values masked)
- ✅ Tests database connection
- ✅ Provides comprehensive diagnostic information

### 4. Enhanced Login Page (`app/auth/login/page.tsx`)
- ✅ Added detailed console logging for all login attempts
- ✅ Logs success and failure with timestamps
- ✅ Special error handling for Configuration and Callback errors
- ✅ Full error stack traces in browser console

---

## 🚀 How to Use the Debugging Tools

### Step 1: Deploy the Changes

1. **Merge or redeploy** the `deployment-fix-verified` branch on Vercel:
   ```bash
   # Option A: Merge to main (if ready)
   git checkout main
   git merge deployment-fix-verified
   git push origin main
   
   # Option B: Vercel will auto-deploy the branch
   # Just wait for the deployment to complete
   ```

2. **Wait for Vercel deployment** to complete (usually 1-2 minutes)

3. **Verify deployment** is live on: https://studiov2-eight.vercel.app

---

### Step 2: Access the Debug Endpoint

Visit the debug endpoint to check configuration:

**URL:** `https://studiov2-eight.vercel.app/api/debug/auth`

This will show you:
- ✅ Current session state
- ✅ Environment variable status (masked)
- ✅ NextAuth configuration
- ✅ Database connection status
- ⚠️ Configuration warnings

**Example Response:**
```json
{
  "success": true,
  "debug": {
    "timestamp": "2025-10-23T...",
    "session": {
      "exists": false,
      "user": null,
      "error": null
    },
    "environment": {
      "NEXTAUTH_URL": {
        "exists": true,
        "value": "https://studiov2-eight....",
        "length": 40
      },
      "NEXTAUTH_SECRET": {
        "exists": true,
        "value": "***SET***",
        "length": 32
      }
    },
    "warnings": []
  }
}
```

---

### Step 3: Attempt Login and Monitor Logs

#### A. Open Vercel Runtime Logs

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: **Studiov2**
3. Click on the latest deployment
4. Click **"Runtime Logs"** tab
5. Keep this tab open

#### B. Open Browser Console

1. Open your browser
2. Navigate to: https://studiov2-eight.vercel.app/auth/login
3. Open Developer Tools:
   - **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox:** Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari:** Enable Developer menu first, then `Cmd+Option+C`
4. Click on the **"Console"** tab
5. Keep this tab open

#### C. Clear Browser Data (Important!)

Before attempting login, clear your cookies:
1. In Developer Tools, go to **"Application"** tab (Chrome) or **"Storage"** tab (Firefox)
2. Under "Cookies", select your domain
3. Delete all cookies
4. **OR** use Incognito/Private browsing mode

#### D. Attempt Login

1. Enter your credentials
2. Click "Sign In"
3. **Watch both consoles simultaneously:**
   - Browser console (client-side logs)
   - Vercel Runtime Logs (server-side logs)

---

### Step 4: Analyze the Logs

Look for these key log entries in **Vercel Runtime Logs**:

#### 🔍 What to Look For:

**Environment Check (on startup):**
```
🔐 NextAuth Environment Check:
✅ DATABASE_URL is configured
✅ NEXTAUTH_SECRET is configured
✅ NEXTAUTH_URL is configured
```

**Authorization Flow:**
```
🔍 Auth: Attempting login for email: user@example.com
✅ Database connection successful
✅ User found: user@example.com (ID: ...)
✅ Authentication successful for user: user@example.com
```

**Callback Flow:**
```
🔐 SignIn callback triggered: {...}
🎫 JWT callback triggered: {...}
🔄 Session callback - Creating session with token: {...}
🔀 Redirect callback triggered: {...}
```

**❌ Error Indicators:**

If you see any of these, we've found the issue:

1. **Missing Environment Variables:**
   ```
   ❌ Missing required environment variable: NEXTAUTH_URL
   ```
   **Solution:** Set the missing environment variable in Vercel

2. **Database Connection Error:**
   ```
   ❌ Database connection failed
   ```
   **Solution:** Check DATABASE_URL and database availability

3. **Session/JWT Callback Error:**
   ```
   ❌ Session callback error: ...
   ❌ JWT callback error: ...
   ```
   **Solution:** Check the error details - might be a token validation issue

4. **Redirect Loop Pattern:**
   ```
   🔀 Redirect callback triggered: { url: '/api/auth/signin', ... }
   🔀 Redirect callback triggered: { url: '/api/auth/signin', ... }
   🔀 Redirect callback triggered: { url: '/api/auth/signin', ... }
   ```
   **Solution:** This indicates infinite redirect - check redirect logic

5. **SignIn Callback Returns False:**
   ```
   ❌ SignIn callback error: ...
   (signIn returns false)
   ```
   **Solution:** Check the error in signIn callback

---

### Step 5: Check Browser Console Logs

In the **Browser Console**, look for:

**Login Attempt:**
```javascript
🔐 Login attempt starting... { email: "...", timestamp: "...", url: "..." }
```

**Login Result:**
```javascript
🔐 Login result received: { ok: true, error: null, status: 200, ... }
// OR
🔐 Login result received: { ok: false, error: "...", status: ..., ... }
```

**❌ Error Indicators:**

1. **Configuration Error:**
   ```javascript
   ❌ Login error details: { error: "Configuration", ... }
   🚨 CONFIGURATION ERROR: Check NEXTAUTH_URL and NEXTAUTH_SECRET in Vercel
   ```

2. **Callback Error:**
   ```javascript
   ❌ Login error details: { error: "Callback", ... }
   🚨 CALLBACK ERROR: Possible redirect loop detected
   ```

3. **Credentials Error:**
   ```javascript
   ❌ Login error details: { error: "CredentialsSignin", ... }
   ```

---

## 🔧 Common Issues and Solutions

### Issue 1: NEXTAUTH_URL Mismatch
**Symptom:** Redirect loop, callback errors

**Check:**
- Vercel Runtime Logs: Look for the NEXTAUTH_URL value logged at startup
- Debug endpoint: Check `environment.NEXTAUTH_URL.value`

**Solution:**
- Set `NEXTAUTH_URL=https://studiov2-eight.vercel.app` in Vercel
- **No trailing slash!**
- Redeploy after changing

### Issue 2: NEXTAUTH_SECRET Missing or Invalid
**Symptom:** Configuration errors, session not persisting

**Check:**
- Debug endpoint: Verify `environment.NEXTAUTH_SECRET.exists` is true

**Solution:**
- Set `NEXTAUTH_SECRET` to a secure random string (32+ characters)
- Redeploy after changing

### Issue 3: Cookie Domain Issues
**Symptom:** Session not persisting, redirect loop

**Check:**
- Browser Developer Tools > Application > Cookies
- Look for cookies: `next-auth.session-token` or `__Secure-next-auth.session-token`

**Solution:**
- Ensure you're accessing via the production URL (not preview URLs)
- Clear cookies and try again
- Check if cookies are being set (should appear after successful login)

### Issue 4: Database Connection Issues
**Symptom:** Authorization fails, database errors in logs

**Check:**
- Debug endpoint: Check `database.status`
- Vercel logs: Look for database connection errors

**Solution:**
- Verify DATABASE_URL is correct
- Check if Prisma is migrated
- Test database connection separately

---

## 📊 Expected Successful Flow

When login works correctly, you should see this sequence:

### In Vercel Runtime Logs:
```
1. 🔍 Auth: Attempting login for email: user@example.com
2. ✅ Database connection successful
3. ✅ User found: user@example.com (ID: xxx)
4. ✅ Authentication successful for user: user@example.com
5. 🔐 SignIn callback triggered: { hasUser: true, ... }
6. 🎫 JWT callback triggered: { hasUser: true, ... }
7. 🎫 JWT callback - Creating token for user: user@example.com
8. ✅ JWT callback - Token created with fields: [...]
9. 🔄 Session callback - Creating session with token: { hasToken: true, ... }
10. 🔀 Redirect callback triggered: { url: '/dashboard', ... }
11. 🔀 Redirect: Using relative URL, redirecting to: https://studiov2-eight.vercel.app/dashboard
12. ✅ Sign in event: user@example.com
```

### In Browser Console:
```
1. 🔐 Login attempt starting... { email: "...", timestamp: "..." }
2. 🔐 Login result received: { ok: true, error: null, status: 200 }
3. ✅ Login successful! { status: 200, ... }
4. ⏳ Waiting for session cookie to propagate...
5. 🔀 Redirecting to dashboard...
```

---

## 🎬 Next Steps

1. **Deploy the changes** (if not already done)
2. **Access the debug endpoint** first: `/api/debug/auth`
3. **Open both consoles** (Vercel + Browser)
4. **Attempt login** and capture all logs
5. **Share the logs** with me if you're still experiencing issues

---

## 📝 Important Notes

- ✅ Debug mode is **temporarily enabled in production** to get detailed logs
- ✅ All sensitive data is **masked** in logs (passwords, secrets, etc.)
- ✅ The debug endpoint is **safe for production** - no secrets exposed
- ⚠️ After we identify and fix the issue, we should **disable debug mode**
- ⚠️ Remember to **clear cookies** before each test attempt

---

## 🆘 If You Still Have Issues

After following all steps above, if the redirect loop persists:

1. **Copy the complete logs** from:
   - Vercel Runtime Logs (especially the callback sequences)
   - Browser Console (especially the login attempt and result)
   - Debug endpoint response

2. **Take screenshots** of:
   - The debug endpoint response
   - The error page (if you see one)
   - The cookie storage in browser dev tools

3. **Share with me:**
   - The logs
   - Screenshots
   - Any error messages you see

This will help me identify the exact root cause and provide a targeted fix!

---

## 🔗 Quick Links

- **Production App:** https://studiov2-eight.vercel.app
- **Debug Endpoint:** https://studiov2-eight.vercel.app/api/debug/auth
- **Login Page:** https://studiov2-eight.vercel.app/auth/login
- **Vercel Dashboard:** https://vercel.com
- **GitHub Repository:** https://github.com/Stefanbotes/Studiov2

---

*Good luck with debugging! The enhanced logging should give us exactly what we need to fix this issue.* 🚀
