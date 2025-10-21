# Studio 2 - Vercel Deployment Troubleshooting Guide

Common issues and solutions when deploying Studio 2 to Vercel.

---

## 🏗️ Build Issues

### Issue: "Module not found" Error

**Symptoms:**
```
Error: Cannot find module 'xyz'
Module not found: Can't resolve 'xyz'
```

**Solutions:**

1. **Missing dependency in package.json**
   ```bash
   # Install the missing package
   npm install <package-name> --save
   
   # Commit and push
   git add package.json package-lock.json
   git commit -m "Add missing dependency"
   git push
   ```

2. **Case-sensitive imports**
   - Linux (Vercel) is case-sensitive, Windows/Mac may not be
   - Ensure import paths match exact file names
   ```javascript
   // Wrong
   import Component from './MyComponent'  // if file is myComponent.tsx
   
   // Correct
   import Component from './myComponent'
   ```

3. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Regenerate package-lock.json"
   git push
   ```

---

### Issue: "Prisma Client not generated" or "Can't find @prisma/client"

**Symptoms:**
```
Error: @prisma/client did not initialize yet
Invalid `prisma.client` invocation
```

**Solutions:**

1. **Add postinstall script**
   
   Edit `package.json`:
   ```json
   {
     "scripts": {
       "postinstall": "npx prisma generate",
       "vercel-build": "npx prisma generate && npx prisma migrate deploy && next build"
     }
   }
   ```

2. **Update vercel.json build command**
   ```json
   {
     "buildCommand": "npx prisma generate && npm run build"
   }
   ```

3. **Check prisma/schema.prisma**
   - Ensure `output` is NOT hardcoded to a specific path
   ```prisma
   generator client {
     provider = "prisma-client-js"
     // Don't use: output = "/absolute/path"
   }
   ```

---

### Issue: TypeScript Build Errors

**Symptoms:**
```
Type error: ...
TS2304: Cannot find name 'xyz'
```

**Solutions:**

1. **Temporarily ignore during builds** (Quick fix)
   
   In `next.config.js`:
   ```javascript
   typescript: {
     ignoreBuildErrors: true, // Change to true
   },
   ```

2. **Fix TypeScript errors** (Proper fix)
   ```bash
   # Check for errors locally
   npm run build
   
   # Fix reported errors
   # Then commit and push
   ```

3. **Update tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "strict": false,
       "skipLibCheck": true
     }
   }
   ```

---

### Issue: ESLint Errors Blocking Build

**Symptoms:**
```
Error: ESLint: ... 
Failed to compile due to ESLint errors
```

**Solutions:**

1. **Ignore ESLint during builds** (Already configured)
   
   In `next.config.js`:
   ```javascript
   eslint: {
     ignoreDuringBuilds: true,
   },
   ```

2. **Fix ESLint errors locally**
   ```bash
   npm run lint
   # Fix reported issues
   ```

---

### Issue: Build Timeout

**Symptoms:**
```
Error: Build exceeded maximum duration
Task timed out after 15 minutes
```

**Solutions:**

1. **Remove large files from repo**
   ```bash
   # Find large files
   find . -type f -size +10M
   
   # Add to .gitignore
   echo "large-file.zip" >> .gitignore
   git rm --cached large-file.zip
   git commit -m "Remove large file"
   git push
   ```

2. **Optimize dependencies**
   ```bash
   # Remove unused dependencies
   npm uninstall <unused-package>
   
   # Use npm prune
   npm prune
   ```

3. **Upgrade Vercel plan** (if needed)
   - Free plan: 15 min build time
   - Pro plan: 45 min build time

---

## 🗄️ Database Issues

### Issue: "Database connection failed"

**Symptoms:**
```
Error: P1001: Can't reach database server
Invalid connection string
```

**Solutions:**

1. **Check DATABASE_URL format**
   ```
   Correct format:
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?connect_timeout=15
   
   Example:
   postgresql://user:pass@db.vercel.app:5432/mydb?connect_timeout=15
   ```

2. **Verify environment variable is set**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure `DATABASE_URL` exists for Production, Preview, and Development
   - Click "Redeploy" after adding

3. **Test connection locally**
   ```bash
   # Pull environment variables
   vercel env pull .env.local
   
   # Test Prisma connection
   npx prisma db pull
   ```

4. **Check database provider status**
   - Vercel Postgres: Check Vercel Dashboard → Storage
   - External provider: Check provider's status page

---

### Issue: "Prisma migration failed"

**Symptoms:**
```
Error: Migration failed
P3009: Failed to migrate
```

**Solutions:**

1. **Run migrations manually**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   
   # Pull env variables
   vercel env pull .env.local
   
   # Run migrations
   npx prisma migrate deploy
   ```

2. **Reset database** (⚠️ DESTROYS ALL DATA)
   ```bash
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

3. **Check database permissions**
   - Ensure database user has CREATE/ALTER permissions
   - For managed databases, check provider settings

---

### Issue: "Too many database connections"

**Symptoms:**
```
Error: P1001: Too many connections
Connection pool timeout
```

**Solutions:**

1. **Add connection pooling to DATABASE_URL**
   ```
   postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10
   ```

2. **Use Prisma Accelerate** (for high-traffic apps)
   - Visit [prisma.io/accelerate](https://www.prisma.io/data-platform/accelerate)
   - Get connection pooling URL
   - Replace DATABASE_URL with Accelerate URL

3. **Close unused connections**
   - Review API routes for unclosed Prisma clients
   - Use `prisma.$disconnect()` when needed

---

## 🔐 Authentication Issues

### Issue: "NEXTAUTH_URL is required"

**Symptoms:**
```
Error: NEXTAUTH_URL environment variable is not set
NextAuth configuration error
```

**Solutions:**

1. **Add NEXTAUTH_URL to Vercel**
   - Go to Settings → Environment Variables
   - Add `NEXTAUTH_URL` with value `https://your-app.vercel.app`
   - Select all environments (Production, Preview, Development)
   - Redeploy

2. **Update after deployment**
   - Get your actual Vercel URL after first deploy
   - Update `NEXTAUTH_URL` with the correct URL
   - Redeploy again

---

### Issue: "Invalid NEXTAUTH_SECRET"

**Symptoms:**
```
Error: NEXTAUTH_SECRET must be provided
JWT verification failed
```

**Solutions:**

1. **Generate a new secret**
   ```bash
   openssl rand -base64 32
   ```

2. **Add to Vercel environment variables**
   - Settings → Environment Variables
   - Add `NEXTAUTH_SECRET` with generated value
   - Must be at least 32 characters
   - Redeploy

3. **Check secret is not empty**
   - Ensure no trailing spaces
   - Ensure quotes are not included in the value

---

### Issue: "Session not persisted / User logged out randomly"

**Symptoms:**
- Users get logged out frequently
- Session doesn't persist across page reloads

**Solutions:**

1. **Check NEXTAUTH_URL matches deployment URL**
   ```
   Wrong: https://studio2-app.vercel.app/
   Right: https://studio2-app.vercel.app
   (no trailing slash)
   ```

2. **Verify database session storage**
   ```bash
   # Check Session table exists
   npx prisma studio
   # Look for "Session" model
   ```

3. **Clear browser cookies and cache**
   - Development issue may be cached old sessions

---

## 🌐 Runtime Errors

### Issue: "404 Not Found" for API routes

**Symptoms:**
- API routes return 404
- `/api/...` endpoints don't work

**Solutions:**

1. **Check API route file location**
   ```
   Correct structure:
   app/api/route-name/route.ts
   
   Or (pages directory):
   pages/api/route-name.ts
   ```

2. **Verify route.ts exports**
   ```typescript
   // app/api/hello/route.ts
   export async function GET(request: Request) {
     return Response.json({ message: 'Hello' });
   }
   ```

3. **Check vercel.json routing**
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "/api/:path*"
       }
     ]
   }
   ```

---

### Issue: "Function execution timeout"

**Symptoms:**
```
Error: Function execution exceeded timeout
Task timed out after 10 seconds
```

**Solutions:**

1. **Increase timeout in vercel.json**
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 30
       }
     }
   }
   ```
   
   Free plan: max 10s
   Pro plan: max 60s

2. **Optimize slow operations**
   - Add database indexes
   - Reduce query complexity
   - Use pagination for large datasets
   - Cache frequently accessed data

3. **Use background jobs** (for long operations)
   - Consider using queues (e.g., Vercel Cron, Inngest)
   - Process large operations asynchronously

---

### Issue: "500 Internal Server Error"

**Symptoms:**
- Random 500 errors
- No specific error message

**Solutions:**

1. **Check Function Logs**
   - Vercel Dashboard → Deployments → Click deployment → Function Logs
   - Look for error details

2. **Add error logging**
   ```typescript
   try {
     // Your code
   } catch (error) {
     console.error('Error details:', error);
     return Response.json({ error: 'Internal error' }, { status: 500 });
   }
   ```

3. **Common causes:**
   - Missing environment variables
   - Database connection issues
   - Unhandled promise rejections
   - Timeout exceeded

---

## 🎨 Frontend Issues

### Issue: "Hydration mismatch" or "Text content does not match"

**Symptoms:**
```
Error: Hydration failed
Text content does not match server-rendered HTML
```

**Solutions:**

1. **Check for Date/Time rendering**
   ```typescript
   // Wrong (server/client mismatch)
   <div>{new Date().toString()}</div>
   
   // Right (use useEffect for client-only)
   const [date, setDate] = useState('');
   useEffect(() => {
     setDate(new Date().toString());
   }, []);
   ```

2. **Use suppressHydrationWarning**
   ```typescript
   <div suppressHydrationWarning>{new Date().toString()}</div>
   ```

3. **Check for localStorage usage in component**
   ```typescript
   // Use useEffect for client-side only code
   useEffect(() => {
     const data = localStorage.getItem('key');
   }, []);
   ```

---

### Issue: "Images not loading" or "Image optimization failed"

**Symptoms:**
- Images show broken
- 404 errors for images

**Solutions:**

1. **Check image paths**
   ```typescript
   // Wrong
   <img src="/public/image.png" />
   
   // Right
   <img src="/image.png" />
   ```

2. **Use Next.js Image component**
   ```typescript
   import Image from 'next/image';
   
   <Image 
     src="/image.png" 
     alt="Description"
     width={500}
     height={300}
   />
   ```

3. **Add domains to next.config.js** (for external images)
   ```javascript
   images: {
     domains: ['example.com', 'cdn.example.com'],
   },
   ```

---

## 📦 Environment Variables Issues

### Issue: Environment variables not updating

**Symptoms:**
- Changed env variables but app still uses old values
- New variables not being picked up

**Solutions:**

1. **Redeploy after changes**
   - Changes require a new deployment
   - Go to Deployments → Redeploy

2. **Check environment selection**
   - Ensure variable is set for correct environment:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. **Use correct syntax in code**
   ```typescript
   // Server-side (Node.js)
   process.env.DATABASE_URL
   
   // Client-side (must prefix with NEXT_PUBLIC_)
   process.env.NEXT_PUBLIC_API_KEY
   ```

---

## 🔧 Vercel CLI Issues

### Issue: "Vercel command not found"

**Solutions:**
```bash
# Install globally
npm install -g vercel

# Or use npx
npx vercel --version
```

---

### Issue: "Login failed" or "Authentication error"

**Solutions:**
```bash
# Logout and login again
vercel logout
vercel login

# Or use token
vercel --token YOUR_TOKEN
```

---

## 📊 Performance Issues

### Issue: "Slow page load" or "Poor performance"

**Solutions:**

1. **Enable Speed Insights**
   - Vercel Dashboard → Speed Insights → Enable

2. **Optimize images**
   - Use Next.js Image component
   - Compress images before uploading
   - Use WebP format

3. **Add loading states**
   ```typescript
   const { data, isLoading } = useSWR('/api/data');
   
   if (isLoading) return <Spinner />;
   ```

4. **Use static generation where possible**
   ```typescript
   // app/page.tsx
   export const revalidate = 3600; // Revalidate every hour
   ```

---

## 🆘 Still Having Issues?

### Debug Checklist

1. **Check build logs**
   - Vercel Dashboard → Deployments → Click deployment → Build Logs

2. **Check function logs**
   - Vercel Dashboard → Deployments → Click deployment → Function Logs

3. **Check environment variables**
   - Settings → Environment Variables
   - Verify all required variables are set

4. **Test locally**
   ```bash
   vercel env pull .env.local
   npm run dev
   ```

5. **Check Vercel status**
   - Visit [vercel-status.com](https://www.vercel-status.com/)

### Get Help

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 📞 Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `MODULE_NOT_FOUND` | Missing dependency | Install missing package |
| `ENOTFOUND` | DNS/Network issue | Check DATABASE_URL and network |
| `ETIMEDOUT` | Connection timeout | Add `connect_timeout=15` to DATABASE_URL |
| `P1001` | Can't reach database | Check DATABASE_URL and database status |
| `P2002` | Unique constraint violation | Check for duplicate data |
| `P2025` | Record not found | Check query logic |

---

**Last Updated**: October 2025

Need more help? Check the main [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
