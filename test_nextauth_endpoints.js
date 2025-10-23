#!/usr/bin/env node
/**
 * ============================================================================
 * NextAuth Endpoint Diagnostic Test Script
 * ============================================================================
 * 
 * This script systematically tests all canonical NextAuth endpoints to
 * diagnose why /api/auth/session returns 404.
 * 
 * Tests performed:
 * 1. /api/auth - Base NextAuth endpoint (should not be 404)
 * 2. /api/auth/providers - JSON list of providers
 * 3. /api/auth/csrf - CSRF token endpoint
 * 4. /api/auth/signin - Sign in page (HTML)
 * 5. /api/auth/session - Session endpoint (currently 404)
 * 
 * Usage:
 *   node test_nextauth_endpoints.js [production_url]
 * 
 * Example:
 *   node test_nextauth_endpoints.js https://studiov2-eight.vercel.app
 * ============================================================================
 */

const https = require('https');
const http = require('http');

// Default to production URL from screenshots
const PRODUCTION_URL = process.argv[2] || 'https://studiov2-eight.vercel.app';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'NextAuth-Diagnostic-Script/1.0',
      },
      // Follow redirects manually to see redirect chain
      followRedirect: false,
    };

    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(path, expectedStatus, description) {
  const url = `${PRODUCTION_URL}${path}`;
  
  log(`\n${'='.repeat(80)}`, colors.cyan);
  log(`Testing: ${path}`, colors.bright);
  log(`Expected: ${description}`, colors.blue);
  log(`URL: ${url}`, colors.blue);
  log('='.repeat(80), colors.cyan);

  try {
    const response = await makeRequest(url);
    
    // Status code check
    const statusMatch = expectedStatus.includes(response.statusCode);
    const statusColor = statusMatch ? colors.green : colors.red;
    log(`\n✓ Status Code: ${response.statusCode} ${response.statusMessage}`, statusColor);
    
    // Content-Type check
    const contentType = response.headers['content-type'] || 'Not set';
    log(`✓ Content-Type: ${contentType}`, colors.blue);
    
    // Cache headers check
    const cacheControl = response.headers['cache-control'] || 'Not set';
    log(`✓ Cache-Control: ${cacheControl}`, colors.blue);
    
    // Body preview (first 200 characters)
    const bodyPreview = response.body.substring(0, 200);
    log(`\n✓ Response Body Preview:`, colors.yellow);
    log(bodyPreview.length > 0 ? bodyPreview : '(empty)', colors.reset);
    if (response.body.length > 200) {
      log(`... (${response.body.length} total characters)`, colors.yellow);
    }

    // Parse JSON if content-type is JSON
    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(response.body);
        log(`\n✓ Parsed JSON:`, colors.yellow);
        log(JSON.stringify(json, null, 2), colors.reset);
      } catch (e) {
        log(`\n✗ Failed to parse JSON: ${e.message}`, colors.red);
      }
    }

    // Check for redirects
    if (response.statusCode >= 300 && response.statusCode < 400) {
      const location = response.headers['location'] || 'Not set';
      log(`\n➜ Redirect Location: ${location}`, colors.yellow);
    }

    // Overall result
    if (statusMatch) {
      log(`\n✅ TEST PASSED`, colors.green);
    } else {
      log(`\n❌ TEST FAILED - Expected ${expectedStatus.join(' or ')}, got ${response.statusCode}`, colors.red);
    }

    return {
      path,
      success: statusMatch,
      statusCode: response.statusCode,
      contentType,
      cacheControl,
      bodyLength: response.body.length,
      response
    };

  } catch (error) {
    log(`\n❌ REQUEST FAILED: ${error.message}`, colors.red);
    return {
      path,
      success: false,
      error: error.message
    };
  }
}

async function runDiagnostics() {
  log('\n' + '='.repeat(80), colors.bright);
  log('NextAuth Endpoint Diagnostic Test', colors.bright);
  log('='.repeat(80), colors.bright);
  log(`Production URL: ${PRODUCTION_URL}`, colors.cyan);
  log(`Timestamp: ${new Date().toISOString()}`, colors.cyan);
  log('='.repeat(80) + '\n', colors.bright);

  const tests = [
    {
      path: '/api/auth',
      expectedStatus: [200, 307],
      description: 'Base NextAuth endpoint (should redirect to signin or return provider list)'
    },
    {
      path: '/api/auth/providers',
      expectedStatus: [200],
      description: 'JSON list of configured authentication providers'
    },
    {
      path: '/api/auth/csrf',
      expectedStatus: [200],
      description: 'CSRF token endpoint (returns JSON with csrfToken)'
    },
    {
      path: '/api/auth/signin',
      expectedStatus: [200],
      description: 'Sign in page (returns HTML)'
    },
    {
      path: '/api/auth/session',
      expectedStatus: [200],
      description: 'Session endpoint (returns JSON with session data or empty object)'
    },
  ];

  const results = [];

  for (const test of tests) {
    const result = await testEndpoint(test.path, test.expectedStatus, test.description);
    results.push(result);
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary report
  log('\n\n' + '='.repeat(80), colors.bright);
  log('DIAGNOSTIC SUMMARY', colors.bright);
  log('='.repeat(80), colors.bright);

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log(`\nTotal Tests: ${results.length}`, colors.cyan);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, colors.red);

  log('\n' + 'Detailed Results:', colors.yellow);
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const color = result.success ? colors.green : colors.red;
    const status = result.statusCode || 'ERROR';
    log(`${icon} ${result.path} - Status: ${status}`, color);
  });

  // Analysis
  log('\n' + '='.repeat(80), colors.bright);
  log('ANALYSIS', colors.bright);
  log('='.repeat(80) + '\n', colors.bright);

  const sessionTest = results.find(r => r.path === '/api/auth/session');
  
  if (sessionTest && !sessionTest.success) {
    log('🔍 Root Cause Analysis for /api/auth/session 404:', colors.yellow);
    log('', colors.reset);
    
    if (sessionTest.statusCode === 404) {
      log('The endpoint is returning 404 Not Found. Possible causes:', colors.red);
      log('', colors.reset);
      log('1. ❌ The route file may not be deployed to production', colors.red);
      log('   → Check: Vercel build logs to see if route was compiled', colors.blue);
      log('   → Check: .vercelignore or .gitignore blocking the file', colors.blue);
      log('', colors.reset);
      log('2. ❌ File structure may be incorrect', colors.red);
      log('   → Expected: app/api/auth/[...nextauth]/route.ts', colors.blue);
      log('   → Verify: Brackets [...nextauth] are correct (not just [nextauth])', colors.blue);
      log('', colors.reset);
      log('3. ❌ Build process may have failed', colors.red);
      log('   → Check: Vercel deployment logs for errors', colors.blue);
      log('   → Check: TypeScript compilation errors', colors.blue);
      log('', colors.reset);
      log('4. ❌ Route may be cached incorrectly', colors.red);
      log('   → Action: Trigger a new deployment (not just cache purge)', colors.blue);
      log('   → Action: Check if route responds after fresh deployment', colors.blue);
    }

    log('\n' + '='.repeat(80), colors.cyan);
    log('RECOMMENDED ACTIONS:', colors.bright);
    log('='.repeat(80) + '\n', colors.cyan);
    
    log('1. Check Vercel deployment logs:', colors.yellow);
    log('   - Go to Vercel dashboard → Deployments → Latest deployment', colors.blue);
    log('   - Look for build errors or warnings', colors.blue);
    log('   - Verify route files are listed in build output', colors.blue);
    log('', colors.reset);
    
    log('2. Verify the file exists in the Git repository:', colors.yellow);
    log('   - Run: git ls-tree -r HEAD --name-only | grep nextauth', colors.blue);
    log('   - Expected output: app/api/auth/[...nextauth]/route.ts', colors.blue);
    log('', colors.reset);
    
    log('3. Force a fresh deployment:', colors.yellow);
    log('   - Make a trivial change to the route file (add a comment)', colors.blue);
    log('   - Commit and push to trigger new deployment', colors.blue);
    log('   - This ensures route is recompiled and deployed', colors.blue);
    log('', colors.reset);
    
    log('4. Check for file path issues:', colors.yellow);
    log('   - Verify no typos in folder name: [...nextauth] not [nextauth]', colors.blue);
    log('   - Verify file extension is .ts not .tsx', colors.blue);
    log('   - Verify file is in app/ not pages/ directory', colors.blue);
  } else if (sessionTest && sessionTest.success) {
    log('✅ /api/auth/session is working correctly!', colors.green);
    log('', colors.reset);
    log('The endpoint is responding as expected.', colors.blue);
    log('If you were seeing 404 errors before, they may have been cached.', colors.blue);
  }

  log('\n' + '='.repeat(80), colors.bright);
  log('END OF DIAGNOSTIC REPORT', colors.bright);
  log('='.repeat(80) + '\n', colors.bright);
}

// Run diagnostics
runDiagnostics().catch(error => {
  log(`\n❌ Fatal error running diagnostics: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
