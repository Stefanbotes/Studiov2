
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ImportSchema } from "@/lib/validationSchemas"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const clientId = formData.get("clientId") as string
    const allowReplace = formData.get("allowReplace") === "true"

    if (!file || !clientId) {
      return NextResponse.json(
        { error: "Missing file or client ID" },
        { status: 400 }
      )
    }

    // Verify file is JSON
    const isJsonFile = file.type === "application/json" || file.name.toLowerCase().endsWith('.json')
    if (!isJsonFile) {
      return NextResponse.json(
        { error: "Only JSON files are supported" },
        { status: 400 }
      )
    }

    // Verify client ownership
    const client = await prisma.clientProfile.findFirst({
      where: { 
        id: clientId, 
        userId: session.user.id 
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      )
    }

    // Parse JSON file
    let fileContent: string
    let parsedData: any
    let assessmentData: any

    try {
      fileContent = await file.text()
      parsedData = JSON.parse(fileContent)
      
      // Validate using existing schema
      assessmentData = ImportSchema.parse(parsedData)
    } catch (error) {
      console.error("File parsing error:", error)
      return NextResponse.json(
        { error: `Failed to parse JSON file: ${(error as Error).message}` },
        { status: 400 }
      )
    }

    // Calculate checksum
    const checksumSha256 = crypto.createHash('sha256').update(fileContent).digest('hex')

    // Generate object key (in a real implementation, this would be stored in S3/cloud storage)
    const objectKey = `assessments/${clientId}/${Date.now()}-${file.name}`

    // Check for duplicate import
    const existingImport = await prisma.assessmentImport.findUnique({
      where: {
        respondentId_assessmentId_completedAt: {
          respondentId: assessmentData.respondentId,
          assessmentId: assessmentData.assessmentId,
          completedAt: new Date(assessmentData.completedAt)
        }
      },
    })

    let wasReplaced = false
    if (existingImport) {
      if (!allowReplace) {
        return NextResponse.json(
          { 
            error: "Assessment already imported", 
            suggestion: "Check 'Replace existing assessment' option to overwrite with Bridge V2 analysis" 
          },
          { status: 409 }
        )
      }
      
      // Delete existing import and related data
      console.log(`[IMPORT] Replacing existing assessment for client ${clientId}`)
      wasReplaced = true
      
      // Delete computed results first
      await prisma.computedResult.deleteMany({
        where: { assessmentImportId: existingImport.id }
      })
      
      // Delete the existing import
      await prisma.assessmentImport.delete({
        where: { id: existingImport.id }
      })
      
      console.log(`[IMPORT] Successfully cleaned up existing assessment data`)
    }

    // Get or create active engagement
    let engagement = await prisma.engagement.findFirst({
      where: {
        clientId: clientId,
        phase: { in: ["INTAKE", "ACTIVE"] }
      }
    })

    if (!engagement) {
      engagement = await prisma.engagement.create({
        data: {
          clientId: clientId,
          phase: "ACTIVE",
          description: "Assessment engagement"
        }
      })
    }

    // Create assessment import record
    const assessmentImport = await prisma.assessmentImport.create({
      data: {
        clientId: clientId,
        engagementId: engagement.id,
        respondentId: assessmentData.respondentId,
        assessmentId: assessmentData.assessmentId,
        schemaVersion: assessmentData.schemaVersion,
        analysisVersion: assessmentData.analysisVersion,
        completedAt: new Date(assessmentData.completedAt),
        objectKey: objectKey,
        checksumSha256: checksumSha256,
        status: "VALIDATED",
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          importedBy: session.user.id,
          importedAt: new Date().toISOString(),
          originalData: JSON.parse(JSON.stringify(assessmentData.raw)) // Ensure proper JSON serialization
        }
      }
    })

    // Create computed results (basic mock analysis)
    const rawData = assessmentData.raw as any // Cast to access dynamic properties
    await prisma.computedResult.create({
      data: {
        assessmentImportId: assessmentImport.id,
        engineVersion: "1.0.0",
        mappingVersion: "1.0.0",
        schemaScoresJson: rawData.schemaScores || rawData.analysis?.schemaScores || {},
        domainScoresJson: rawData.domainScores || rawData.analysis?.domainScores || {},
        modeScoresJson: rawData.modeScores || rawData.analysis?.modeScores || {},
        riskFlagsJson: rawData.riskFlags || rawData.analysis?.riskFlags || {}
      }
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        engagementId: engagement.id,
        actorId: session.user.id,
        action: wasReplaced ? "REPLACE" : "IMPORT",
        objectType: "ASSESSMENT",
        objectId: assessmentImport.id,
        contextJson: {
          fileName: file.name,
          clientId: clientId,
          assessmentId: assessmentData.assessmentId,
          replaced: wasReplaced
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      assessmentImportId: assessmentImport.id,
      replaced: wasReplaced,
      message: wasReplaced ? 
        "Assessment successfully replaced and ready for Bridge V2 analysis" : 
        "Assessment successfully imported"
    })

  } catch (error) {
    console.error("Assessment import error:", error)
    return NextResponse.json(
      { error: "Failed to import assessment" },
      { status: 500 }
    )
  }
}
