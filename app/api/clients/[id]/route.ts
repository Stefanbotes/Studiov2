
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify database connection
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not configured")
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      )
    }

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
      pseudonym,
      isActive
    } = body

    // Verify client ownership
    const existingClient = await prisma.clientProfile.findFirst({
      where: { 
        id: params.id, 
        userId: session.user.id 
      }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      )
    }

    // Update client
    const updatedClient = await prisma.clientProfile.update({
      where: { id: params.id },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        role: role?.trim() || null,
        ageRange: ageRange || null,
        aspirations: aspirations?.trim() || null,
        pseudonym: pseudonym?.trim() || null,
        isActive: Boolean(isActive)
      }
    })

    return NextResponse.json({ 
      success: true, 
      client: updatedClient 
    })

  } catch (error) {
    console.error("Client update error:", error)
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify database connection
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not configured")
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await prisma.clientProfile.findFirst({
      where: { 
        id: params.id, 
        userId: session.user.id 
      },
      include: {
        engagements: {
          include: {
            imports: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      )
    }

    return NextResponse.json({ client })

  } catch (error) {
    console.error("Client fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    )
  }
}
