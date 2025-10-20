
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      totalClients,
      activeEngagements, 
      totalAssessments,
      recentImports
    ] = await Promise.all([
      prisma.clientProfile.count({
        where: { userId: session.user.id, isActive: true }
      }),
      prisma.engagement.count({
        where: { 
          client: { userId: session.user.id },
          phase: { in: ["INTAKE", "ACTIVE"] }
        }
      }),
      prisma.assessmentImport.count({
        where: { client: { userId: session.user.id } }
      }),
      prisma.assessmentImport.count({
        where: {
          client: { userId: session.user.id },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    return NextResponse.json({
      totalClients,
      activeEngagements,
      totalAssessments,
      recentImports
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
