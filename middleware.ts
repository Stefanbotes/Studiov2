import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isPublicPage = req.nextUrl.pathname === "/"

    console.log('🔒 Middleware check:', {
      path: req.nextUrl.pathname,
      isAuth,
      isAuthPage,
      isPublicPage,
      hasToken: !!token
    })

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuth && isAuthPage) {
      console.log('✅ Authenticated user on auth page, redirecting to dashboard')
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // If user is authenticated and on home page, redirect to dashboard
    if (isAuth && isPublicPage) {
      console.log('✅ Authenticated user on home page, redirecting to dashboard')
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Allow access to public pages and auth pages for unauthenticated users
    if (!isAuth && (isPublicPage || isAuthPage)) {
      console.log('✅ Unauthenticated user accessing public/auth page, allowing access')
      return NextResponse.next()
    }

    // For protected pages, withAuth will handle the redirect
    console.log('✅ Allowing request to proceed')
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
        const isPublicPage = req.nextUrl.pathname === "/"
        
        // Allow access to auth pages and home page without token
        if (isAuthPage || isPublicPage) {
          return true
        }
        
        // Require token for all other pages
        return !!token
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|api/trpc).*)",
  ],
}
