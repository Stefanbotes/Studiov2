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
 * CRITICAL FIX: Explicitly exclude ALL API routes from matcher
 * This prevents middleware from interfering with NextAuth API routes
 * which must return JSON, not HTML
 * 
 * The previous matcher was allowing middleware to run on /api/auth/* routes,
 * causing x-matched-path to be incorrectly set to '/' and returning HTML
 * instead of JSON for /api/auth/session
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API routes including /api/auth/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.* (files with extensions like .jpg, .png, .css, .js, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
