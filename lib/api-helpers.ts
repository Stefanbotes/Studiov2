import { NextResponse } from "next/server"
import { prisma } from "./db"

/**
 * Check if database is configured properly
 * Returns an error response if not available, or null if everything is OK
 */
export function checkDatabaseAvailability(): NextResponse | null {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not configured")
    return NextResponse.json(
      { error: "Database configuration error" },
      { status: 500 }
    )
  }

  return null
}

/**
 * Get the Prisma client instance
 * The client is always available after prisma generate runs
 */
export function getPrismaClient() {
  return prisma
}
