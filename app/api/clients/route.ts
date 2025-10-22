
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { checkDatabaseAvailability, getPrismaClient } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Check database availability
    const dbError = checkDatabaseAvailability()
    if (dbError) return dbError

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const clients = await prisma.clientProfile.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            engagements: true,
            assessmentImports: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Failed to fetch clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check database availability
    const dbError = checkDatabaseAvailability()
    if (dbError) return dbError

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      role, 
      ageRange, 
      aspirations, 
      pseudonym 
    } = body

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      )
    }

    const prisma = getPrismaClient()
    const client = await prisma.clientProfile.create({
      data: {
        userId: session.user.id,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        role: role || null,
        ageRange: ageRange || null,
        aspirations: aspirations || null,
        pseudonym: pseudonym || null,
      }
    })

    // Create an initial engagement for the client
    await prisma.engagement.create({
      data: {
        clientId: client.id,
        phase: "INTAKE",
        description: "Initial engagement"
      }
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Failed to create client:", error)
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}
