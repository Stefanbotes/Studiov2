
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

// Validate required environment variables
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
}

// Optional environment variables (will use trustHost if not set)
const optionalEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
}

// Log environment variable status (without exposing values)
console.log('🔐 NextAuth Environment Check:')
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`)
  } else {
    console.log(`✅ ${key} is configured`)
  }
})

Object.entries(optionalEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.log(`ℹ️  ${key} not set - using trustHost (auto-detect from request)`)
  } else {
    console.log(`✅ ${key} is configured`)
  }
})

// Warn about missing REQUIRED environment variables only
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error(`⚠️  WARNING: Missing REQUIRED environment variables: ${missingVars.join(', ')}`)
  console.error('⚠️  Authentication may not work correctly without these variables')
}

// Type assertion to include trustHost property which exists in NextAuth v4 runtime
// but may not be in the TypeScript type definitions for this version
export const authOptions: NextAuthOptions & { trustHost?: boolean } = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // Send to custom error page with logging
  },
  // CRITICAL FIX: Trust the host header when NEXTAUTH_URL is not set
  // This allows NextAuth to work correctly on Vercel without hardcoding the URL
  // The host header will be automatically detected from the request
  useSecureCookies: process.env.NODE_ENV === "production",
  trustHost: true, // Required for Vercel deployments and dynamic URLs
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate credentials exist
          if (!credentials?.email || !credentials?.password) {
            console.error('❌ Auth Error: Missing email or password in credentials')
            throw new Error('Email and password are required')
          }

          console.log(`🔍 Auth: Attempting login for email: ${credentials.email}`)

          // Check database connection
          try {
            await prisma.$connect()
            console.log('✅ Database connection successful')
          } catch (dbError) {
            console.error('❌ Database connection failed:', dbError)
            throw new Error('Database connection failed. Please check DATABASE_URL.')
          }

          // Find user by email
          let user
          try {
            user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              }
            })
          } catch (queryError) {
            console.error('❌ Error querying user from database:', queryError)
            throw new Error('Database query failed. Check if database is migrated.')
          }

          if (!user) {
            console.error(`❌ Auth Error: No user found with email: ${credentials.email}`)
            throw new Error('Invalid email or password')
          }

          console.log(`✅ User found: ${user.email} (ID: ${user.id})`)

          // Check if user has a password set
          if (!user.password) {
            console.error(`❌ Auth Error: User ${user.email} has no password set`)
            throw new Error('Account has no password. Please contact administrator.')
          }

          // Verify password
          let isPasswordValid = false
          try {
            isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            )
          } catch (bcryptError) {
            console.error('❌ Error comparing passwords:', bcryptError)
            throw new Error('Password verification failed')
          }

          if (!isPasswordValid) {
            console.error(`❌ Auth Error: Invalid password for user: ${user.email}`)
            throw new Error('Invalid email or password')
          }

          console.log(`✅ Authentication successful for user: ${user.email}`)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            license: user.license,
            organization: user.organization,
          }
        } catch (error) {
          // Log the full error for debugging
          console.error('❌ Authorization Error:', error)
          
          // Return null to indicate auth failure (NextAuth will handle the error message)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log('🔐 SignIn callback triggered:', {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          hasAccount: !!account,
          accountProvider: account?.provider,
          hasCredentials: !!credentials,
          timestamp: new Date().toISOString()
        })
        
        // Always allow sign in - any issues should be caught by authorize()
        return true
      } catch (error) {
        console.error('❌ SignIn callback error:', error)
        console.error('❌ SignIn callback error stack:', error instanceof Error ? error.stack : 'No stack trace')
        // Return false to prevent sign in if there's an error
        return false
      }
    },
    async session({ session, token }) {
      try {
        console.log('🔄 Session callback - Creating session with token:', {
          hasToken: !!token,
          tokenId: token.id,
          sessionUserEmail: session?.user?.email,
          tokenSub: token.sub,
          timestamp: new Date().toISOString()
        })
        
        // Validate that token has required fields
        if (!token.id) {
          console.error('❌ Session callback: Token missing id field')
        }
        
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            role: token.role as string,
            license: token.license as string,
            organization: token.organization as string,
          },
        }
      } catch (error) {
        console.error('❌ Session callback error:', error)
        console.error('❌ Session callback error stack:', error instanceof Error ? error.stack : 'No stack trace')
        return session
      }
    },
    async jwt({ token, user, account, trigger }) {
      try {
        console.log('🎫 JWT callback triggered:', {
          hasUser: !!user,
          userEmail: user?.email,
          hasToken: !!token,
          tokenSub: token.sub,
          trigger: trigger,
          timestamp: new Date().toISOString()
        })
        
        if (user) {
          console.log('🎫 JWT callback - Creating token for user:', user.email)
          const u = user as any
          const newToken = {
            ...token,
            id: u.id,
            role: u.role,
            license: u.license,
            organization: u.organization,
          }
          console.log('✅ JWT callback - Token created with fields:', Object.keys(newToken))
          return newToken
        }
        
        console.log('🎫 JWT callback - Returning existing token')
        return token
      } catch (error) {
        console.error('❌ JWT callback error:', error)
        console.error('❌ JWT callback error stack:', error instanceof Error ? error.stack : 'No stack trace')
        return token
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 Redirect callback triggered:', { 
        url, 
        baseUrl,
        urlStartsWithSlash: url.startsWith("/"),
        urlOrigin: url.startsWith("http") ? new URL(url).origin : 'N/A',
        baseUrlMatches: url.startsWith("http") ? (new URL(url).origin === baseUrl) : false,
        timestamp: new Date().toISOString()
      })
      
      // After sign in, always redirect to dashboard
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        const redirectUrl = `${baseUrl}${url}`
        console.log('🔀 Redirect: Using relative URL, redirecting to:', redirectUrl)
        return redirectUrl
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log('🔀 Redirect: Same origin, redirecting to:', url)
        return url
      }
      // Default to dashboard after successful sign in
      const defaultUrl = `${baseUrl}/dashboard`
      console.log('🔀 Redirect: Using default dashboard URL:', defaultUrl)
      return defaultUrl
    },
  },
  // Enable debug mode to get more detailed logs
  // TEMPORARILY enabled in production for debugging redirect loop
  debug: true,
  // Add custom error handling
  events: {
    async signIn(message) {
      console.log('✅ Sign in event:', message.user.email)
    },
    async signOut(message) {
      console.log('👋 Sign out event')
    },
    async createUser(message) {
      console.log('👤 User created:', message.user.email)
    },
    async linkAccount(message) {
      console.log('🔗 Account linked')
    },
    async session(message) {
      // Don't log every session check, too noisy
    },
  },
}
