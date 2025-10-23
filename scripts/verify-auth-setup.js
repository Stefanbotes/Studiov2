#!/usr/bin/env node

/**
 * Authentication Setup Verification Script
 * 
 * This script helps verify that all authentication components are properly configured
 * Run this script to diagnose authentication issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Studio 2 Authentication Setup Verification\n');
console.log('=' .repeat(60));

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment variables
console.log('\n1️⃣  Checking Environment Variables...');
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} is set`);
    
    // Special checks for NEXTAUTH_URL
    if (envVar === 'NEXTAUTH_URL') {
      const url = process.env[envVar];
      if (url.includes('localhost') && process.env.VERCEL) {
        console.log(`   ⚠️  WARNING: NEXTAUTH_URL is set to localhost but running on Vercel!`);
        console.log(`      Current value: ${url}`);
        console.log(`      Expected: Your Vercel deployment URL`);
        hasWarnings = true;
      } else if (url.includes('localhost')) {
        console.log(`   ℹ️  NEXTAUTH_URL is set to localhost (OK for local development)`);
      } else {
        console.log(`   ✅ NEXTAUTH_URL is set to production URL: ${url}`);
      }
    }
  } else {
    console.log(`   ❌ ${envVar} is NOT set`);
    hasErrors = true;
  }
});

// Check 2: Critical files
console.log('\n2️⃣  Checking Critical Files...');
const criticalFiles = [
  'middleware.ts',
  'lib/auth.ts',
  'app/api/auth/[...nextauth]/route.ts',
  'components/providers.tsx',
  'app/auth/login/page.tsx',
  'app/dashboard/layout.tsx',
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} is missing`);
    hasErrors = true;
  }
});

// Check 3: Middleware configuration
console.log('\n3️⃣  Checking Middleware Configuration...');
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  if (middlewareContent.includes('withAuth')) {
    console.log('   ✅ Middleware uses withAuth from next-auth');
  } else {
    console.log('   ⚠️  WARNING: Middleware might not be using next-auth properly');
    hasWarnings = true;
  }
  
  if (middlewareContent.includes('matcher')) {
    console.log('   ✅ Middleware has matcher configuration');
  } else {
    console.log('   ❌ Middleware is missing matcher configuration');
    hasErrors = true;
  }
} else {
  console.log('   ℹ️  Middleware file will be created by the fix');
}

// Check 4: SessionProvider configuration
console.log('\n4️⃣  Checking SessionProvider Configuration...');
const providersPath = path.join(process.cwd(), 'components/providers.tsx');
if (fs.existsSync(providersPath)) {
  const providersContent = fs.readFileSync(providersPath, 'utf8');
  
  if (providersContent.includes('SessionProvider')) {
    console.log('   ✅ SessionProvider is imported');
  } else {
    console.log('   ❌ SessionProvider is NOT imported');
    hasErrors = true;
  }
  
  if (providersContent.includes('mounted') && providersContent.includes('useState')) {
    console.log('   ⚠️  WARNING: Providers might be using problematic mounted check');
    console.log('      This can cause redirect loops!');
    hasWarnings = true;
  } else {
    console.log('   ✅ No problematic mounted check detected');
  }
  
  if (providersContent.includes('refetchInterval')) {
    console.log('   ✅ SessionProvider has refetchInterval configured');
  } else {
    console.log('   ⚠️  WARNING: SessionProvider might not have refetch configured');
    hasWarnings = true;
  }
}

// Check 5: Database connection
console.log('\n5️⃣  Checking Database Connection...');
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`   ✅ Database URL is valid`);
    console.log(`   ℹ️  Protocol: ${url.protocol}`);
    console.log(`   ℹ️  Host: ${url.hostname}`);
  } catch (error) {
    console.log(`   ❌ Database URL is invalid: ${error.message}`);
    hasErrors = true;
  }
} else {
  console.log(`   ❌ DATABASE_URL is not set`);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:');

if (hasErrors) {
  console.log('   ❌ ERRORS FOUND - Please fix the issues above');
} else if (hasWarnings) {
  console.log('   ⚠️  WARNINGS FOUND - Review the warnings above');
} else {
  console.log('   ✅ ALL CHECKS PASSED');
}

console.log('\n🚀 Next Steps:');

if (hasErrors || hasWarnings) {
  console.log('\n   For Vercel Deployment:');
  console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('   2. Set NEXTAUTH_URL to your Vercel deployment URL');
  console.log('   3. Ensure NEXTAUTH_SECRET is set (generate with: openssl rand -base64 32)');
  console.log('   4. Ensure DATABASE_URL is set correctly');
  console.log('   5. Redeploy your application');
  console.log('\n   For Local Development:');
  console.log('   1. Copy .env.example to .env');
  console.log('   2. Update all environment variables');
  console.log('   3. Run: npm run dev');
}

console.log('\n📚 Documentation:');
console.log('   - VERCEL_NEXTAUTH_URL_SETUP.md - How to configure NEXTAUTH_URL');
console.log('   - AUTH_REDIRECT_LOOP_FIX_REPORT.md - Detailed fix explanation');
console.log('   - TROUBLESHOOTING.md - Common issues and solutions');

console.log('\n' + '='.repeat(60) + '\n');

// Exit with error code if there are errors
if (hasErrors) {
  process.exit(1);
}
