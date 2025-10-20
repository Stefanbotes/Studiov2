
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const CreateNoteSchema = z.object({
  clientId: z.string(),
  framework: z.enum(["leadership", "clinical", "advanced_insights", "coaching"]),
  section: z.string(),
  subSection: z.string().optional(),
  content: z.string().min(1),
  order: z.number().int().default(0)
})

const UpdateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  order: z.number().int().optional(),
  isArchived: z.boolean().optional()
})

// GET - Fetch coaching notes for a client
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get("clientId")
    const framework = searchParams.get("framework")
    const section = searchParams.get("section")
    const subSection = searchParams.get("subSection")

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      )
    }

    // Verify client ownership
    const client = await prisma.clientProfile.findFirst({
      where: { id: clientId, userId: session.user.id }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      )
    }

    // Build where clause
    const where: any = {
      clientId,
      isArchived: false
    }

    if (framework) where.framework = framework
    if (section) where.section = section
    if (subSection) where.subSection = subSection

    const notes = await prisma.coachingNote.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ notes })

  } catch (error) {
    console.error("Get coaching notes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

// POST - Create new coaching note
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = CreateNoteSchema.parse(body)

    // Verify client ownership
    const client = await prisma.clientProfile.findFirst({
      where: { 
        id: validatedData.clientId, 
        userId: session.user.id 
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      )
    }

    // Get active engagement for context
    const engagement = await prisma.engagement.findFirst({
      where: {
        clientId: validatedData.clientId,
        phase: { in: ["INTAKE", "ACTIVE"] }
      }
    })

    // Create note
    const note = await prisma.coachingNote.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        engagementId: engagement?.id || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create audit event
    if (engagement) {
      await prisma.auditEvent.create({
        data: {
          engagementId: engagement.id,
          actorId: session.user.id,
          action: "NOTE_CREATE",
          objectType: "COACHING_NOTE",
          objectId: note.id,
          contextJson: {
            framework: validatedData.framework,
            section: validatedData.section,
            subSection: validatedData.subSection
          }
        }
      })
    }

    return NextResponse.json({ note }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create coaching note error:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}
