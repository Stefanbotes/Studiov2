
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const CreateResolutionSchema = z.object({
  clientId: z.string(),
  primarySchemaId: z.string(),
  secondarySchemaId: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  resolutionMethod: z.enum(["MANUAL", "AUTO", "ASSESSMENT_BASED"]).default("MANUAL"),
  metadata: z.object({}).passthrough().optional()
})

// GET - Get schema resolution for a client
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get("clientId")

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

    // Get active schema pack version
    const activeSchemaPackVersion = await prisma.schemaPackVersion.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })

    if (!activeSchemaPackVersion) {
      return NextResponse.json(
        { error: "No active schema pack found" },
        { status: 404 }
      )
    }

    // Get schema resolution
    const resolution = await prisma.schemaResolution.findUnique({
      where: {
        clientId_schemaPackVersionId: {
          clientId,
          schemaPackVersionId: activeSchemaPackVersion.id
        }
      },
      include: {
        schemaPackVersion: true
      }
    })

    return NextResponse.json({ 
      resolution,
      schemaPackVersion: activeSchemaPackVersion
    })

  } catch (error) {
    console.error("Get schema resolution error:", error)
    return NextResponse.json(
      { error: "Failed to fetch schema resolution" },
      { status: 500 }
    )
  }
}

// POST - Create or update schema resolution for a client
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = CreateResolutionSchema.parse(body)

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

    // Get active schema pack version
    const activeSchemaPackVersion = await prisma.schemaPackVersion.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })

    if (!activeSchemaPackVersion) {
      return NextResponse.json(
        { error: "No active schema pack found" },
        { status: 404 }
      )
    }

    // Create or update resolution
    const resolution = await prisma.schemaResolution.upsert({
      where: {
        clientId_schemaPackVersionId: {
          clientId: validatedData.clientId,
          schemaPackVersionId: activeSchemaPackVersion.id
        }
      },
      update: {
        primarySchemaId: validatedData.primarySchemaId,
        secondarySchemaId: validatedData.secondarySchemaId,
        confidenceScore: validatedData.confidenceScore,
        resolutionMethod: validatedData.resolutionMethod,
        metadata: validatedData.metadata
      },
      create: {
        clientId: validatedData.clientId,
        schemaPackVersionId: activeSchemaPackVersion.id,
        primarySchemaId: validatedData.primarySchemaId,
        secondarySchemaId: validatedData.secondarySchemaId,
        confidenceScore: validatedData.confidenceScore,
        resolutionMethod: validatedData.resolutionMethod,
        metadata: validatedData.metadata
      },
      include: {
        schemaPackVersion: true
      }
    })

    return NextResponse.json({ resolution })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create schema resolution error:", error)
    return NextResponse.json(
      { error: "Failed to create schema resolution" },
      { status: 500 }
    )
  }
}
