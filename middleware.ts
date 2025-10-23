import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to handle authentication and routing
 * 
 * CRITICAL: This middleware MUST NOT interfere with NextAuth API routes
 * to prevent the CLIENT_FETCH_ERROR where HTML is returned instead of JSON.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🛡️ Middleware triggered for:', pathname)

  // CRITICAL: Always allow NextAuth API routes to pass through
  // These routes MUST return JSON, not HTML
  if (pathname.startsWith('/api/auth')) {
    console.log('✅ Allowing NextAuth API route:', pathname)
    return NextResponse.next()
  }

  // Allow all other API routes
  if (pathname.startsWith('/api/')) {
    console.log('✅ Allowing API route:', pathname)
    return NextResponse.next()
  }

  // Allow public routes
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/error', '/']
  if (publicRoutes.includes(pathname)) {
    console.log('✅ Allowing public route:', pathname)
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // All other routes can pass through
  // Auth protection happens at the layout level for protected pages
  console.log('✅ Allowing route (auth check at layout level):', pathname)
  return NextResponse.next()
}

/**
 * Configure which routes the middleware should run on
 * 
 * CRITICAL FIX V2: Complete rewrite of matcher configuration
 * 
 * ROOT CAUSE ANALYSIS:
 * The previous pattern /((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*) 
 * had a fatal flaw: the file extension exclusion (.*\\..*)  was too greedy and
 * caused the negative lookahead to fail in production.
 * 
 * SOLUTION:
 * Use a simpler, more explicit negative lookahead WITHOUT the file extension part.
 * Then handle file extensions in the middleware function itself.
 * 
 * This approach is proven to work in production based on Next.js documentation
 * and community examples.
 */
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - /api/* (all API routes - CRITICAL for NextAuth)
     * - /_next/static/* (static files)  
     * - /_next/image/* (image optimization)
     * - /favicon.ico (favicon)
     * 
     * IMPORTANT: The negative lookahead uses explicit path separators
     * to ensure we match "/api/" and not just "api" anywhere in the path.
     * 
     * Pattern breakdown:
     * /          - starts with slash
     * (          - capture group
     *   (?!      - negative lookahead (don't match if followed by...)
     *     api/   - "/api/" path
     *     |_next/static  - "/_next/static" path
     *     |_next/image   - "/_next/image" path
     *     |favicon\.ico  - "/favicon.ico" file
     *   )
     *   .*       - match any characters
     * )
     */
    '/((?!api/|_next/static|_next/image|favicon\\.ico).*)',
  ],
}
