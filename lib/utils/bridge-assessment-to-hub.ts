
// Bridge utility to connect uploaded assessments to the coaching hub

import { prisma } from "@/lib/db"
import { getCanonicalMappingByVariableId } from "@/lib/canonical-schema-mapping"
import { getLASBIVariableId, isModernLASBIItemId } from "@/lib/lasbi-item-mapping"
import * as fs from "fs"
import * as path from "path"

/**
 * Transform assessment data from stored format to Bridge V2 expected format
 * Includes LASBI item mapping to canonical schema IDs
 */
function transformToBridgeV2Format(assessmentData: any): any {
  console.log(`[TRANSFORM] Converting assessment data to Bridge V2 format`)
  
  // Handle different possible data structures
  let sourceData = assessmentData
  
  // If the data is wrapped in a 'raw' property (from Excel/CSV imports)
  if (assessmentData.raw) {
    sourceData = assessmentData.raw
  }
  
  // Extract the components we need
  const instrument = sourceData.assessment?.instrument || sourceData.instrument
  const rawItems = instrument?.items || sourceData.items || []
  
  console.log(`[TRANSFORM] Found ${rawItems.length} raw items in assessment data`)
  
  if (!instrument || rawItems.length === 0) {
    throw new Error('No valid instrument data or items found in assessment')
  }

  // Transform LASBI items to Bridge V2 format with schema mapping
  const transformedItems = []
  let mappedCount = 0
  let skippedCount = 0

  for (const rawItem of rawItems) {
    try {
      // Extract variable ID from LASBI question ID 
      const questionId = rawItem.id || rawItem.questionId
      if (!questionId) {
        console.warn(`[TRANSFORM] ⚠️ Item missing ID, skipping:`, rawItem)
        skippedCount++
        continue
      }

      let variableId: string | null = null

      // Check if this is a modern LASBI ID format (like "cmff2ushm0000sbb3xz75fwkz")
      if (isModernLASBIItemId(questionId)) {
        console.log(`[TRANSFORM] 🔍 Modern LASBI ID detected: ${questionId}`)
        variableId = getLASBIVariableId(questionId)
        if (!variableId) {
          console.warn(`[TRANSFORM] ⚠️ No mapping found for modern LASBI ID: ${questionId}`)
          skippedCount++
          continue
        }
        console.log(`[TRANSFORM] ✅ Mapped ${questionId} → ${variableId}`)
      } else {
        // For legacy LASBI format, extract variable ID (first two parts: "1.1.R1" → "1.1")
        variableId = questionId.split('.').slice(0, 2).join('.')
        console.log(`[TRANSFORM] 🔍 Legacy LASBI ID: ${questionId} → ${variableId}`)
      }
      
      // Get canonical mapping for this variable ID
      if (!variableId) {
        console.warn(`[TRANSFORM] ⚠️ No variable ID could be determined for: ${questionId}`)
        skippedCount++
        continue
      }

      const mapping = getCanonicalMappingByVariableId(variableId)
      if (!mapping) {
        console.warn(`[TRANSFORM] ⚠️ No canonical mapping found for variable ID: ${variableId} (from ${questionId})`)
        skippedCount++
        continue
      }

      // Transform item to Bridge V2 expected format
      const transformedItem = {
        id: questionId,
        schema_id: mapping.clinical_id, // This is the key field Bridge V2 needs!
        raw: rawItem.value || rawItem.raw || rawItem.score, // LASBI stores scores as 'value'
        weight: 1, // Default weight
        reverse: false // Default, could be enhanced based on question metadata
      }

      transformedItems.push(transformedItem)
      mappedCount++

    } catch (error) {
      console.error(`[TRANSFORM] ❌ Failed to transform item:`, rawItem, error)
      skippedCount++
    }
  }

  console.log(`[TRANSFORM] 📊 Item mapping results:`)
  console.log(`[TRANSFORM] - Successfully mapped: ${mappedCount} items`)
  console.log(`[TRANSFORM] - Skipped: ${skippedCount} items`)

  if (transformedItems.length === 0) {
    throw new Error('No items could be mapped to canonical schemas - check LASBI item format and canonical mapping')
  }

  // Transform to Bridge V2 expected format
  const rawSchemaVersion = sourceData.schemaVersion || "1.0.0"
  // Convert "1.0.0" to "1.0" to match schema validation regex
  const normalizedSchemaVersion = rawSchemaVersion.split('.').slice(0, 2).join('.')
  
  // Normalize instrument name for consistent conversion table lookup
  const instrumentName = instrument.name || "LASBI"
  console.log(`[TRANSFORM] 🔍 Original instrument name: "${instrumentName}"`)
  
  const transformedData = {
    schemaVersion: normalizedSchemaVersion,
    instrument: {
      name: instrumentName,
      version: sourceData.analysisVersion || instrument.version || "1.0.0"
    },
    respondent: {
      id: sourceData.respondent?.id || `respondent-${Date.now()}`
    },
    assessment: {
      assessmentId: sourceData.assessment?.assessmentId || sourceData.assessmentId || `assessment-${Date.now()}`,
      completedAt: sourceData.assessment?.completedAt || sourceData.completedAt || new Date().toISOString()
    },
    items: transformedItems
  }
  
  console.log(`[TRANSFORM] ✅ Transformation complete:`)
  console.log(`[TRANSFORM] - Instrument: ${transformedData.instrument.name} v${transformedData.instrument.version}`)
  console.log(`[TRANSFORM] - Items: ${transformedData.items.length} (with schema_id mapping)`)
  console.log(`[TRANSFORM] - Respondent: ${transformedData.respondent.id}`)
  console.log(`[TRANSFORM] - Assessment: ${transformedData.assessment.assessmentId}`)
  
  return transformedData
}

/**
 * Bridge an uploaded assessment file to the coaching hub using Bridge V2
 */
export async function bridgeAssessmentToHub(
  assessmentFilePath: string,
  clientId?: string
): Promise<{ success: boolean; coacheeId: string; message: string }> {
  try {
    console.log(`[BRIDGE_V2_FILE] Processing file: ${assessmentFilePath}`)
    
    // Read the assessment file
    const assessmentData = JSON.parse(fs.readFileSync(assessmentFilePath, 'utf-8'))
    
    // Try to find matching client in database if clientId provided
    let clientRecord = null
    if (clientId) {
      clientRecord = await prisma.clientProfile.findUnique({
        where: { id: clientId },
        include: { user: true }
      })
    }
    
    if (!clientRecord) {
      throw new Error('Client record is required for Bridge V2 processing')
    }

    // Use Bridge V2 system for file-based assessments
    const { bridgeAssessmentWithHardGating } = await import('./bridge-engine-v2')
    const { ImportPayloadSchema } = await import('../types/immutable-contracts')
    
    // Transform assessment data to Bridge V2 format
    const transformedData = transformToBridgeV2Format(assessmentData)
    console.log(`[BRIDGE_V2_FILE] Transformed file data for Bridge V2 compatibility`)
    
    // Validate transformed data against schema
    try {
      ImportPayloadSchema.parse(transformedData)
      console.log(`[BRIDGE_V2_FILE] Schema validation passed`)
    } catch (validationError) {
      throw new Error(`Schema validation failed: ${validationError instanceof Error ? validationError.message : String(validationError)}`)
    }
    
    // Configure Bridge V2 with lineage storage
    const bridgeConfig = {
      analysis_version: 'bridge@2.1.0-file',
      fail_fast: true,
      store_lineage: true
    }
    
    // Execute Bridge V2 processing
    const result = await bridgeAssessmentWithHardGating(transformedData, clientRecord, bridgeConfig)
    
    if (result.success) {
      console.log(`[BRIDGE_V2_FILE] Successfully bridged file assessment`)
      return {
        success: true,
        coacheeId: result.coachee_id!,
        message: `Bridge V2: Successfully bridged assessment file with comprehensive schema analysis (${(result.lineage?.processing_duration_ms || 0)}ms)`
      }
    } else {
      const failureReason = result.processing_notes?.join('; ') || 'Unknown Bridge V2 failure'
      throw new Error(`Bridge V2 failed: ${failureReason}`)
    }
    
  } catch (error) {
    console.error("[BRIDGE_V2_FILE] Error bridging assessment file:", error)
    return {
      success: false,
      coacheeId: '',
      message: `Failed to bridge assessment: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Bridge assessment data from database to coaching hub (Bridge V2 Only)
 */
export async function bridgeAssessmentFromDatabase(
  assessmentImport: any,
  clientRecord: any
): Promise<{ success: boolean; coacheeId: string; message: string }> {
  try {
    console.log(`[BRIDGE_V2] Processing assessment for client ${clientRecord.firstName} ${clientRecord.lastName}`)
    console.log(`[BRIDGE_V2] Using Bridge V2 (Legacy system removed)`)
    console.log(`[BRIDGE_V2] Assessment import ID: ${assessmentImport.id}`)
    
    // Extract assessment data from database metadata
    const metadata = assessmentImport.metadata as any
    
    if (!metadata?.originalData) {
      throw new Error(`No original assessment data found for assessment ${assessmentImport.assessmentId}`)
    }

    const assessmentData = metadata.originalData

    // Bridge V2 Only - No fallback system
    const { bridgeAssessmentWithHardGating } = await import('./bridge-engine-v2')
    const { ImportPayloadSchema } = await import('../types/immutable-contracts')
    
    console.log(`[BRIDGE_V2] 🔄 Starting transformation for ${clientRecord.firstName} ${clientRecord.lastName}`)
    
    // Transform assessment data to Bridge V2 format
    const transformedData = transformToBridgeV2Format(assessmentData)
    console.log(`[BRIDGE_V2] ✅ Transformed assessment data for Bridge V2 compatibility`)
    console.log(`[BRIDGE_V2] - Instrument: ${transformedData.instrument.name}`)
    console.log(`[BRIDGE_V2] - Items: ${transformedData.items.length} (with schema_id mapping)`)
    
    // Validate transformed data against schema
    try {
      ImportPayloadSchema.parse(transformedData)
      console.log(`[BRIDGE_V2] ✅ Schema validation passed for ${clientRecord.firstName} ${clientRecord.lastName}`)
    } catch (validationError) {
      console.error(`[BRIDGE_V2] ❌ Schema validation failed:`, validationError)
      throw new Error(`Schema validation failed: ${validationError instanceof Error ? validationError.message : String(validationError)}`)
    }
    
    // Configure Bridge V2 with lineage storage for Schema Rankings
    const bridgeConfig = {
      analysis_version: 'bridge@2.1.0',
      fail_fast: true,
      store_lineage: true  // Critical for Schema Rankings tab
    }
    
    // Execute Bridge V2 processing
    const result = await bridgeAssessmentWithHardGating(transformedData, clientRecord, bridgeConfig)
    
    if (result.success) {
      console.log(`[BRIDGE_V2] ✅ Bridge V2 successful for ${clientRecord.firstName} ${clientRecord.lastName}`)
      console.log(`[BRIDGE_V2] 🎯 Schema rankings generated: ${result.lineage?.schema_rankings?.length || 0} schemas`)
      return {
        success: true,
        coacheeId: result.coachee_id!,
        message: `Bridge V2: Successfully bridged assessment with comprehensive schema analysis (${(result.lineage?.processing_duration_ms || 0)}ms)`
      }
    } else {
      // Bridge V2 failed - throw error instead of falling back
      console.error(`[BRIDGE_V2] ❌ Bridge V2 failed for ${clientRecord.firstName} ${clientRecord.lastName}:`)
      result.processing_notes?.forEach(note => console.error(`[BRIDGE_V2]   - ${note}`))
      
      const failureReason = result.processing_notes?.join('; ') || 'Unknown Bridge V2 failure'
      throw new Error(`Bridge V2 failed: ${failureReason}`)
    }
    
  } catch (error) {
    console.error("[BRIDGE_V2] Error bridging assessment:", error)
    return {
      success: false,
      coacheeId: '',
      message: `Failed to bridge assessment: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Bridge all uploaded assessments for a specific user (Bridge V2 Only)
 */
export async function bridgeUserAssessments(
  userId: string
): Promise<{
  success: boolean
  bridged: number
  failed: number
  messages: string[]
}> {
  const results = {
    success: true,
    bridged: 0,
    failed: 0,
    messages: [] as string[]
  }
  
  try {
    console.warn(`🚨 STARTING BRIDGE V2 ASSESSMENT PROCESS for user: ${userId}`)
    console.log(`[STRICT BRIDGE] Starting assessment bridging for user: ${userId}`)
    
    // Get all clients for this user with their assessment imports
    const clients = await prisma.clientProfile.findMany({
      where: { userId },
      include: { 
        user: true,
        assessmentImports: {
          where: { 
            status: 'VALIDATED'
          },
          orderBy: { createdAt: 'desc' },
          take: 1 // Get only the most recent assessment per client
        }
      }
    })
    
    console.log(`[STRICT BRIDGE] Database query results:`)
    console.log(`[STRICT BRIDGE] - Total clients: ${clients.length}`)
    console.log(`[STRICT BRIDGE] - Client details:`)
    clients.forEach((client: any, index: number) => {
      console.log(`[STRICT BRIDGE]   ${index + 1}. ${client.firstName} ${client.lastName} (ID: ${client.id}) - Assessments: ${client.assessmentImports.length}`)
      if (client.assessmentImports.length > 0) {
        console.log(`[STRICT BRIDGE]      └─ Latest: ${client.assessmentImports[0].assessmentId} (${client.assessmentImports[0].status})`)
      }
    })
    
    // Only process clients that have validated assessment imports with actual data
    const clientsWithAssessments = clients.filter((client: any) => {
      const hasAssessment = client.assessmentImports.length > 0
      if (hasAssessment) {
        const assessment = client.assessmentImports[0]
        const hasMetadata = assessment.metadata !== null
        const hasOriginalData = assessment.metadata && (assessment.metadata as any).originalData
        
        console.log(`[STRICT BRIDGE] ${client.firstName} ${client.lastName}: assessment=${hasAssessment}, metadata=${hasMetadata}, originalData=${!!hasOriginalData}`)
        
        return hasAssessment && hasMetadata
      }
      return false
    })
    
    console.log(`[STRICT BRIDGE] ✓ ${clientsWithAssessments.length} clients have valid assessments to bridge`)
    
    if (clientsWithAssessments.length === 0) {
      results.messages.push(`❌ NO ASSESSMENTS FOUND: No clients have validated assessment data to bridge`)
      results.messages.push(`📋 Total clients: ${clients.length}, Clients with assessments: 0`)
      results.messages.push(`🔍 Check: 1) Assessment uploads, 2) Validation status, 3) Metadata presence`)
      return results
    }
    
    results.messages.push(`📊 STRICT BRIDGING: Processing ${clientsWithAssessments.length} clients with validated assessment data`)
    
    // Process each client with their most recent assessment
    for (let i = 0; i < clientsWithAssessments.length; i++) {
      const client = clientsWithAssessments[i]
      const progress = Math.round(((i + 1) / clientsWithAssessments.length) * 100)
      
      try {
        // Get the most recent validated assessment
        const latestAssessment = (client as any).assessmentImports[0]
        
        console.log(`[BRIDGE] Processing ${client.firstName} ${client.lastName} (${progress}%) with assessment ${latestAssessment.assessmentId}`)
        
        // Bridge this specific client's assessment from database using Bridge V2
        const result = await bridgeAssessmentFromDatabase(latestAssessment, client)
        
        if (result.success) {
          results.bridged++
          results.messages.push(`✓ [${progress}%] ${result.message}`)
          console.log(`[BRIDGE] Successfully bridged ${client.firstName} ${client.lastName}`)
        } else {
          results.failed++
          results.messages.push(`✗ [${progress}%] ${result.message}`)
          console.error(`[BRIDGE] Failed to bridge ${client.firstName} ${client.lastName}: ${result.message}`)
        }
        
      } catch (error) {
        results.failed++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.messages.push(`✗ [${progress}%] ${client.firstName} ${client.lastName}: ${errorMsg}`)
        console.error(`[BRIDGE] Error processing ${client.firstName} ${client.lastName}:`, error)
      }
    }
    
    // Final summary
    const totalProcessed = results.bridged + results.failed
    results.messages.push(`🎯 Completed: ${results.bridged} successful, ${results.failed} failed out of ${totalProcessed} clients`)
    
    if (results.failed > results.bridged) {
      results.success = false
    }
    
  } catch (error) {
    results.success = false
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    results.messages.push(`❌ Critical error during bridging: ${errorMsg}`)
    console.error('[BRIDGE] Critical bridging error:', error)
  }
  
  return results
}
