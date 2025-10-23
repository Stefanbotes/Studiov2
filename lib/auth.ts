
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

// Validate required environment variables
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
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

// Warn about missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error(`⚠️  WARNING: Missing environment variables: ${missingVars.join(', ')}`)
  console.error('⚠️  Authentication may not work correctly without these variables')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
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
    session: ({ session, token }) => {
      try {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            role: token.role,
            license: token.license,
            organization: token.organization,
          },
        }
      } catch (error) {
        console.error('❌ Session callback error:', error)
        return session
      }
    },
    jwt: ({ token, user }) => {
      try {
        if (user) {
          const u = user as any
          return {
            ...token,
            id: u.id,
            role: u.role,
            license: u.license,
            organization: u.organization,
          }
        }
        return token
      } catch (error) {
        console.error('❌ JWT callback error:', error)
        return token
      }
    },
  },
  // Enable debug mode to get more detailed logs
  debug: process.env.NODE_ENV === 'development',
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
