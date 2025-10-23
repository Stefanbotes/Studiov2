# Vercel Authentication Setup Guide

## 🔐 Overview

Your Studio 2 application uses **NextAuth.js with Credentials Provider** for authentication. This means users log in with email and password stored in your PostgreSQL database.

**Important**: This is NOT email-based authentication (like magic links). Users must have accounts created in the database with hashed passwords.

---

## 📋 Required Environment Variables

You must configure these environment variables in Vercel for authentication to work:

### 1. **DATABASE_URL** (CRITICAL)
- **Description**: PostgreSQL database connection string
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?connect_timeout=15`
- **Example**: `postgresql://user:pass@host.db.io:5432/mydb?connect_timeout=15`
- **Where to get it**: 
  - From your database provider (Vercel Postgres, Supabase, Railway, etc.)
  - If using Vercel Postgres, it's automatically added when you attach the database

### 2. **NEXTAUTH_SECRET** (CRITICAL)
- **Description**: Secret key used to encrypt JWT tokens and session data
- **Format**: A random 32+ character string
- **How to generate**:
  ```bash
  openssl rand -base64 32
  ```
  Or use: https://generate-secret.vercel.app/32
- **Example**: `JiwMZ945W995hca62G5VYmrLaKKqsvf0`
- **Security**: NEVER commit this to git or share it publicly

### 3. **NEXTAUTH_URL** (CRITICAL for Production)
- **Description**: The full URL of your deployed application
- **Format**: `https://your-app-name.vercel.app`
- **Example**: `https://studio-2-coaching.vercel.app`
- **Note**: Update this after your first deployment

### 4. **AWS Configuration** (Optional - for file storage)
If your app uses AWS S3 for file uploads:
- `AWS_PROFILE`: `hosted_storage`
- `AWS_REGION`: Your AWS region (e.g., `us-west-2`)
- `AWS_BUCKET_NAME`: Your S3 bucket name
- `AWS_FOLDER_PREFIX`: Folder prefix for organizing files

---

## 🚀 Step-by-Step Setup in Vercel

### Step 1: Access Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (Studio 2 / Studiov2)
3. Click **Settings** → **Environment Variables**

### Step 2: Add Required Variables

For **each environment variable**, add it separately:

#### Add DATABASE_URL:
1. Click **Add New**
2. **Key**: `DATABASE_URL`
3. **Value**: Your PostgreSQL connection string
4. **Environments**: Select all three (Production, Preview, Development)
5. Click **Save**

#### Add NEXTAUTH_SECRET:
1. Click **Add New**
2. **Key**: `NEXTAUTH_SECRET`
3. **Value**: Generate using `openssl rand -base64 32`
4. **Environments**: Select all three
5. Click **Save**

#### Add NEXTAUTH_URL:
1. Click **Add New**
2. **Key**: `NEXTAUTH_URL`
3. **Value**: `https://your-app-name.vercel.app` (use your actual Vercel URL)
4. **Environments**: 
   - Production: Your production URL
   - Preview: Can use same or leave blank
   - Development: `http://localhost:3000`
5. Click **Save**

### Step 3: Redeploy

After adding all environment variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots menu → **Redeploy**
4. Check **Use existing Build Cache** (optional)
5. Click **Redeploy**

---

## 🗄️ Database Setup

### Ensure Database is Migrated

Your database must have the required tables. Run these commands locally or in your CI/CD:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Required Tables

Your Prisma schema includes these NextAuth tables:
- ✅ `User` - Stores user accounts
- ✅ `Account` - Stores OAuth accounts (if using OAuth in future)
- ✅ `Session` - Stores user sessions
- ✅ `VerificationToken` - For email verification tokens

### Create a Test User

To test authentication, you need to create a user in the database. You can use the Prisma Studio or a seed script:

```typescript
// Example: Create a user with bcrypt hashed password
import bcrypt from 'bcryptjs';
import { prisma } from './lib/db';

async function createUser() {
  const hashedPassword = await bcrypt.hash('your-password', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'Coach',
    }
  });
  
  console.log('User created:', user);
}

createUser();
```

---

## 🐛 Troubleshooting

### Issue 1: "Internal Server Error" on Sign In

**Possible Causes:**
1. Missing `DATABASE_URL` - Check Vercel environment variables
2. Missing `NEXTAUTH_SECRET` - Generate and add one
3. Database not migrated - Run `npx prisma migrate deploy`
4. No users in database - Create a test user

**Solution:**
- Check Vercel deployment logs: **Deployments** → Click on deployment → **View Function Logs**
- Look for error messages starting with ❌ in the logs
- The enhanced logging in `lib/auth.ts` will show exactly what's wrong

### Issue 2: Database Connection Failed

**Error**: "Database connection failed. Please check DATABASE_URL."

**Solution:**
1. Verify `DATABASE_URL` is correctly set in Vercel
2. Check database is accessible from Vercel's region
3. Ensure connection string includes `?connect_timeout=15`
4. Test connection using Prisma Studio locally

### Issue 3: User Not Found

**Error**: "Invalid email or password"

**Solution:**
1. Verify user exists in database
2. Check email is correct (case-sensitive)
3. Create a user if needed using the seed script above

### Issue 4: Invalid Password

**Error**: "Invalid email or password"

**Solution:**
1. Ensure password is hashed with bcrypt (not plain text)
2. Verify password hash is correct format
3. Test password with bcrypt compare locally

### Issue 5: NEXTAUTH_URL Not Set

**Warning**: Authentication works locally but fails in production

**Solution:**
1. Add `NEXTAUTH_URL` with your full Vercel URL
2. Redeploy application
3. Clear browser cache and try again

---

## 📊 Verifying Setup

### Check Environment Variables

In Vercel:
1. Go to **Settings** → **Environment Variables**
2. Verify these are set:
   - ✅ `DATABASE_URL`
   - ✅ `NEXTAUTH_SECRET`
   - ✅ `NEXTAUTH_URL`

### Check Deployment Logs

After deploying:
1. Go to **Deployments** → Click latest deployment
2. Click **View Function Logs**
3. Look for startup messages:
   ```
   🔐 NextAuth Environment Check:
   ✅ DATABASE_URL is configured
   ✅ NEXTAUTH_SECRET is configured
   ✅ NEXTAUTH_URL is configured
   ```

If you see ❌ for any variable, that one is missing or not set correctly.

### Test Authentication

1. Go to your deployed app URL
2. Navigate to `/auth/login`
3. Try logging in with a test user
4. Check function logs for detailed error messages if it fails

---

## 🔒 Security Best Practices

### DO:
- ✅ Use strong random `NEXTAUTH_SECRET` (32+ characters)
- ✅ Keep environment variables private
- ✅ Use HTTPS in production (Vercel handles this automatically)
- ✅ Hash passwords with bcrypt before storing
- ✅ Regularly rotate `NEXTAUTH_SECRET` (will invalidate all sessions)

### DON'T:
- ❌ Never commit `.env` files to git
- ❌ Never share `NEXTAUTH_SECRET` publicly
- ❌ Never store plain text passwords in database
- ❌ Never expose database credentials in client-side code

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment)

---

## 🆘 Getting Help

If you continue to experience issues:

1. **Check Function Logs**: The detailed logging in `lib/auth.ts` will pinpoint the exact issue
2. **Verify Database**: Use Prisma Studio to check database structure and data
3. **Test Locally**: Ensure authentication works locally before deploying
4. **Review Environment**: Double-check all environment variables are set correctly

The enhanced error logging will provide clear messages like:
- `❌ Missing required environment variable: DATABASE_URL`
- `❌ Database connection failed`
- `❌ No user found with email: user@example.com`
- `❌ Invalid password for user: user@example.com`

These messages will appear in Vercel's Function Logs and help you identify the exact problem.

---

## ✅ Quick Checklist

Before testing authentication, ensure:

- [ ] `DATABASE_URL` is set in Vercel
- [ ] `NEXTAUTH_SECRET` is set in Vercel (generated with `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` is set to your Vercel app URL
- [ ] Database is migrated (`npx prisma migrate deploy`)
- [ ] At least one test user exists in the database
- [ ] Test user has a bcrypt-hashed password
- [ ] Application has been redeployed after setting environment variables
- [ ] Function logs show all environment variables are configured (✅)

---

**Last Updated**: October 2025
**Version**: 1.0
