import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * Safe Debug Endpoint for NextAuth Configuration
 * 
 * This endpoint provides diagnostic information WITHOUT exposing secrets.
 * Safe to use in production for debugging authentication issues.
 */
export async function GET() {
  try {
    console.log('🔍 Debug endpoint called at:', new Date().toISOString())

    // Get current session (if any)
    let session = null
    let sessionError = null
    try {
      session = await getServerSession(authOptions)
      console.log('✅ Debug: Session retrieved successfully', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email
      })
    } catch (error) {
      sessionError = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Debug: Error getting session:', error)
    }

    // Check environment variables (masked)
    const envVars = {
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL ? 
          `${process.env.NEXTAUTH_URL.substring(0, 20)}...` : 
          'NOT SET',
        length: process.env.NEXTAUTH_URL?.length || 0
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        value: process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT SET',
        length: process.env.NEXTAUTH_SECRET?.length || 0
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        value: process.env.DATABASE_URL ? 
          `${process.env.DATABASE_URL.split(':')[0]}://***` : 
          'NOT SET',
        length: process.env.DATABASE_URL?.length || 0
      },
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      VERCEL: process.env.VERCEL || 'NOT SET',
      VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET'
    }

    console.log('🔍 Debug: Environment variables checked:', {
      nextAuthUrlExists: envVars.NEXTAUTH_URL.exists,
      nextAuthSecretExists: envVars.NEXTAUTH_SECRET.exists,
      databaseUrlExists: envVars.DATABASE_URL.exists,
      nodeEnv: envVars.NODE_ENV,
      vercelEnv: envVars.VERCEL_ENV
    })

    // Check NextAuth configuration
    const authConfig = {
      session_strategy: authOptions.session?.strategy || 'NOT SET',
      session_maxAge: authOptions.session?.maxAge || 'NOT SET',
      pages_signIn: authOptions.pages?.signIn || 'NOT SET',
      pages_error: authOptions.pages?.error || 'NOT SET',
      providers_count: authOptions.providers?.length || 0,
      debug_mode: authOptions.debug || false,
      callbacks_configured: {
        signIn: !!authOptions.callbacks?.signIn,
        session: !!authOptions.callbacks?.session,
        jwt: !!authOptions.callbacks?.jwt,
        redirect: !!authOptions.callbacks?.redirect,
      }
    }

    console.log('🔍 Debug: NextAuth configuration checked:', authConfig)

    // Test database connection
    let dbStatus = 'UNKNOWN'
    let dbError = null
    try {
      const { prisma } = await import('@/lib/db')
      await prisma.$connect()
      dbStatus = 'CONNECTED'
      console.log('✅ Debug: Database connection successful')
      await prisma.$disconnect()
    } catch (error) {
      dbStatus = 'ERROR'
      dbError = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Debug: Database connection failed:', error)
    }

    // Prepare response
    const debugInfo = {
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user ? {
          email: session.user.email,
          hasId: !!(session.user as any).id,
          hasRole: !!(session.user as any).role,
        } : null,
        error: sessionError
      },
      environment: envVars,
      nextauth: authConfig,
      database: {
        status: dbStatus,
        error: dbError
      },
      warnings: [] as string[]
    }

    // Add warnings for common issues
    if (!envVars.NEXTAUTH_URL.exists) {
      debugInfo.warnings.push('❌ NEXTAUTH_URL is not set')
    }
    if (!envVars.NEXTAUTH_SECRET.exists) {
      debugInfo.warnings.push('❌ NEXTAUTH_SECRET is not set')
    }
    if (!envVars.DATABASE_URL.exists) {
      debugInfo.warnings.push('❌ DATABASE_URL is not set')
    }
    if (dbStatus === 'ERROR') {
      debugInfo.warnings.push('❌ Database connection failed')
    }
    if (envVars.NEXTAUTH_URL.exists && envVars.NEXTAUTH_URL.value.includes('localhost')) {
      debugInfo.warnings.push('⚠️ NEXTAUTH_URL contains localhost - should be production URL in production')
    }

    console.log('🔍 Debug: Response prepared with', debugInfo.warnings.length, 'warnings')

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Debug information retrieved successfully. Check server logs for detailed output.'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    console.error('❌ Debug endpoint error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error in debug endpoint',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
