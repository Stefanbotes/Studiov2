
/**
 * BRIDGE ENGINE V2 - QA Implementation
 * Hard gating with transactional approach and complete error handling
 */

import { 
  ImportPayload,
  ImportPayloadSchema,
  BridgeTransactionResult,
  AnalysisLineage,
  SCHEMA_SELECTION_THRESHOLDS,
  CanonicalId
} from '@/lib/types/immutable-contracts'
import { normalizeAssessmentItems } from './normalization-engine'
import { selectPrimarySecondarySchemas } from './schema-selection-engine'
import { resolveCanonicalContent, loadValidatedSchemaPack, generateContentErrorReport } from './content-resolver'
import { storeCoacheeProfile } from '@/lib/services/coachee-profiles'
import { createCanonicalProfile } from './canonical-profile-builder'
import { thresholds } from '@/config/thresholds'
import { getAllCanonicalClinicalIds } from '@/lib/canonical-schema-mapping'

export interface BridgeConfig {
  analysis_version: string
  fail_fast: boolean
  store_lineage: boolean
}

const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  analysis_version: 'bridge@2.1.0',
  fail_fast: true,
  store_lineage: true
}

/**
 * Bridge assessment with hard gating - one transaction per profile
 * validate → normalize → rank → resolve content (assert all verticals) → save
 */
export async function bridgeAssessmentWithHardGating(
  assessmentData: any,
  clientRecord: any,
  config: BridgeConfig = DEFAULT_BRIDGE_CONFIG
): Promise<BridgeTransactionResult> {
  const startTime = Date.now()
  const coacheeId = clientRecord.id
  
  console.log(`[BRIDGE_V2] Starting hard-gated bridge for coachee: ${coacheeId}`)
  console.log(`[BRIDGE_V2] Analysis version: ${config.analysis_version}`)

  try {
    // STEP 1: Validate input payload (immutable contract)
    console.log(`[BRIDGE_V2] Step 1: Validating input payload`)
    let validatedPayload: ImportPayload
    
    try {
      validatedPayload = ImportPayloadSchema.parse(assessmentData)
      console.log(`[BRIDGE_V2] ✅ Payload validation successful`)
    } catch (validationError) {
      console.error(`[BRIDGE_V2] ❌ Payload validation failed:`, validationError)
      return {
        success: false,
        errors: [],
        warnings: [],
        processing_notes: [
          'Payload validation failed',
          `Error: ${validationError instanceof Error ? validationError.message : 'Unknown validation error'}`
        ]
      }
    }

    // STEP 2: Normalize items (deterministic conversion)
    console.log(`[BRIDGE_V2] Step 2: Normalizing ${validatedPayload.items.length} items`)
    const normalizationResult = normalizeAssessmentItems(validatedPayload)
    
    if (!normalizationResult.success || normalizationResult.normalized_items.length === 0) {
      console.error(`[BRIDGE_V2] ❌ Normalization failed`)
      return {
        success: false,
        errors: [],
        warnings: [],
        processing_notes: [
          'Normalization failed',
          `Failed items: ${normalizationResult.failed_items.length}`,
          `Reasons: ${normalizationResult.failed_items.map(f => f.reason).join(', ')}`
        ]
      }
    }

    console.log(`[BRIDGE_V2] ✅ Normalized ${normalizationResult.normalized_items.length} items`)

    // STEP 3: Select primary/secondary schemas (deterministic ranking)
    console.log(`[BRIDGE_V2] Step 3: Selecting primary/secondary schemas`)
    const selectionResult = selectPrimarySecondarySchemas(normalizationResult.normalized_items)
    
    // STEP 3.2: Descriptive fallback when NO primary was found (enables Secondary content)
    if (!selectionResult.primary) {
      console.log(`[BRIDGE_V2] ⚠️ No primary found via strict selection - creating exploratory primary/secondary for coaching`)
      
      try {
        // Aggregate mean T-score by schema from normalized_items
        const bySchema = new Map<string, { sum: number; n: number }>()
        for (const item of normalizationResult.normalized_items || []) {
          const e = bySchema.get(item.schema_id) || { sum: 0, n: 0 }
          e.sum += item.tscore
          e.n += 1
          bySchema.set(item.schema_id, e)
        }

        const summaries = [...bySchema.entries()]
          .map(([schemaId, e]) => ({
            schemaId,
            tscore: Math.round(e.sum / (e.n || 1)),
            count: e.n
          }))
          .sort((a, b) => b.tscore - a.tscore)

        if (summaries.length > 0) {
          // Choose exploratory primary and optional secondary
          const primaryCandidate = summaries[0]
          const secondaryCandidate = summaries[1] // second best, if present
          
          // Get instrument name from the first normalized item
          const instrumentName = normalizationResult.normalized_items.find(item => item.schema_id === primaryCandidate.schemaId)?.instrument || 'LASBI'

          // Promote to selectionResult so downstream code treats them as selected
          selectionResult.primary = {
            clinical_id: primaryCandidate.schemaId as CanonicalId,
            tscore: primaryCandidate.tscore,
            reliability: 0.6,       // exploratory
            item_count: primaryCandidate.count,
            instrument: instrumentName
          }

          if (secondaryCandidate) {
            const secondaryInstrumentName = normalizationResult.normalized_items.find(item => item.schema_id === secondaryCandidate.schemaId)?.instrument || 'LASBI'
            
            selectionResult.secondary = {
              clinical_id: secondaryCandidate.schemaId as CanonicalId,
              tscore: secondaryCandidate.tscore,
              reliability: 0.6,
              item_count: secondaryCandidate.count,
              instrument: secondaryInstrumentName
            }
          }
          
          ;(selectionResult.selection_notes ||= []).push(
            `Descriptive fallback: exploratory primary ${selectionResult.primary.clinical_id} (T${selectionResult.primary.tscore})` +
            (selectionResult.secondary ? `, exploratory secondary ${selectionResult.secondary.clinical_id} (T${selectionResult.secondary.tscore})` : '')
          )
          
          console.log(`[BRIDGE_V2] ✅ Descriptive fallback created: Primary ${primaryCandidate.schemaId} (T${primaryCandidate.tscore})` +
            (secondaryCandidate ? `, Secondary ${secondaryCandidate.schemaId} (T${secondaryCandidate.tscore})` : ''))
        }
      } catch (error) {
        console.warn(`[BRIDGE_V2] ⚠️ Descriptive fallback failed:`, error)
        // Continue - not a fatal error
      }
    }
    
    // STEP 3.5: Fallback secondary selection for coaching completeness (when primary exists)
    if (selectionResult.primary && !selectionResult.secondary) {
      console.log(`[BRIDGE_V2] ⚠️ No secondary found via strict selection - attempting fallback for coaching`)
      
      try {
        // Group normalized items by schema and calculate average T-scores
        const schemaScores = new Map<string, {tscore: number, items: number}>()
        
        for (const item of normalizationResult.normalized_items) {
          if (!schemaScores.has(item.schema_id)) {
            schemaScores.set(item.schema_id, {tscore: 0, items: 0})
          }
          const schema = schemaScores.get(item.schema_id)!
          schema.tscore += item.tscore
          schema.items += 1
        }
        
        // Calculate averages and find fallback candidates
        const candidates: Array<{schema_id: string, tscore: number}> = []
        for (const [schemaId, data] of schemaScores.entries()) {
          // Skip the primary schema
          if (schemaId === selectionResult.primary.clinical_id) continue
          
          const avgTscore = Math.round(data.tscore / data.items)
          candidates.push({schema_id: schemaId, tscore: avgTscore})
        }
        
        if (candidates.length > 0) {
          // Sort by T-score descending
          candidates.sort((a, b) => b.tscore - a.tscore)
          
          // Pick best candidate: ≥ thresholds.subthresholdMin (50) or highest available
          const fallbackCandidate = candidates.find(c => c.tscore >= thresholds.subthresholdMin) || candidates[0]
          
          if (fallbackCandidate) {
            const itemCount = schemaScores.get(fallbackCandidate.schema_id)!.items
            
            // Get instrument name from the first normalized item
            const instrumentName = normalizationResult.normalized_items.find(item => item.schema_id === fallbackCandidate.schema_id)?.instrument || 'LASBI'
            
            selectionResult.secondary = {
              clinical_id: fallbackCandidate.schema_id as CanonicalId,
              tscore: fallbackCandidate.tscore,
              reliability: 0.6, // Mark as moderate reliability for fallback
              item_count: itemCount,
              instrument: instrumentName
            }
            
            console.log(`[BRIDGE_V2] ✅ Fallback secondary selected: ${fallbackCandidate.schema_id} (T${fallbackCandidate.tscore}) - exploratory coaching content`)
          }
        }
      } catch (error) {
        console.warn(`[BRIDGE_V2] ⚠️ Fallback secondary selection failed:`, error)
        // Continue without secondary - not a fatal error
      }
    }
    
    // Make sure selectedSchemas includes whatever we have after fallback logic (primary, secondary, tertiary)
    let selectedSchemas: CanonicalId[] = []
    let hasValidPrimary = false
    
    if (!selectionResult.primary) {
      console.warn(`[BRIDGE_V2] ⚠️ No primary schema found even after fallback - continuing with minimal profile`)
      console.log(`[BRIDGE_V2] Selection notes: ${selectionResult.selection_notes?.join('; ') || 'No selection notes'}`)
      
      // This case should be rare now that we have descriptive fallback
    } else {
      hasValidPrimary = true
      selectedSchemas.push(selectionResult.primary.clinical_id)
      if (selectionResult.secondary) {
        selectedSchemas.push(selectionResult.secondary.clinical_id)
      }
      if (selectionResult.tertiary) {
        selectedSchemas.push(selectionResult.tertiary.clinical_id)
      }
    }

    if (hasValidPrimary) {
      console.log(`[BRIDGE_V2] ✅ Selected schemas: ${selectedSchemas.join(', ')}`)
      console.log(`[BRIDGE_V2] - Primary: ${selectionResult.primary!.clinical_id} (T${selectionResult.primary!.tscore})`)
      if (selectionResult.secondary) {
        console.log(`[BRIDGE_V2] - Secondary: ${selectionResult.secondary.clinical_id} (T${selectionResult.secondary.tscore})`)
      }
      if (selectionResult.tertiary) {
        console.log(`[BRIDGE_V2] - Tertiary: ${selectionResult.tertiary.clinical_id} (T${selectionResult.tertiary.tscore})`)
      }
    } else {
      console.log(`[BRIDGE_V2] ✅ Proceeding with descriptive analysis (no schemas meet clinical threshold)`)
    }

    // STEP 4: Load and validate schema pack
    console.log(`[BRIDGE_V2] Step 4: Loading schema pack`)
    const schemaPack = await loadValidatedSchemaPack()

    // STEP 5: Resolve content (assert all verticals) - Skip if no clinical schemas
    let contentResult: any
    
    if (selectedSchemas.length > 0) {
      console.log(`[BRIDGE_V2] Step 5: Resolving canonical content for ${selectedSchemas.length} schemas`)
      contentResult = await resolveCanonicalContent(selectedSchemas, schemaPack)
      
      if (!contentResult.success) {
        console.error(`[BRIDGE_V2] ❌ Content resolution failed`)
        const errorReport = generateContentErrorReport(contentResult.completeness_errors)
        console.error(errorReport)
        
        return {
          success: false,
          errors: contentResult.completeness_errors,
          warnings: contentResult.warnings,
          processing_notes: [
            'Content resolution failed - missing required verticals',
            `Schemas with errors: ${contentResult.completeness_errors.map((e: any) => e.schema_id).join(', ')}`,
            errorReport
          ]
        }
      }
      console.log(`[BRIDGE_V2] ✅ Content resolution successful`)
    } else {
      console.log(`[BRIDGE_V2] Step 5: Skipping content resolution (descriptive profile mode)`)
      contentResult = {
        success: true,
        resolved_content: null,
        warnings: [],
        completeness_errors: []
      }
    }

    // STEP 6: Build canonical profile
    console.log(`[BRIDGE_V2] Step 6: Building canonical profile`)
    const canonicalProfile = createCanonicalProfile(
      validatedPayload,
      selectionResult,
      contentResult.resolved_content,
      {
        name: `${clientRecord.firstName} ${clientRecord.lastName}`,
        email: clientRecord.email,
        organization: clientRecord.user?.organization,
        role: clientRecord.role
      }
    )

    // STEP 7: Create analysis lineage with full schema rankings
    const processingDuration = Date.now() - startTime
    
    // Extract full schema rankings for visualization
    const fullRankings = normalizationResult.normalized_items ? (() => {
      const schemaGroups = new Map<string, any[]>()
      
      // Group items by schema
      for (const item of normalizationResult.normalized_items) {
        const schemaId = item.schema_id
        if (!schemaGroups.has(schemaId)) {
          schemaGroups.set(schemaId, [])
        }
        schemaGroups.get(schemaId)!.push(item)
      }
      
      // Calculate T-scores for all schemas
      const rankings = []
      for (const [schemaId, schemaItems] of schemaGroups) {
        let weightedSum = 0
        let totalWeight = 0
        
        for (const item of schemaItems) {
          weightedSum += item.tscore * item.weight
          totalWeight += item.weight
        }
        
        if (totalWeight > 0) {
          const aggregatedTscore = Math.round(weightedSum / totalWeight)
          const reliability = Math.min(schemaItems.length / 3, 1.0)
          
          // ❌ FIXED: Percentile calculation was using /50 instead of /40
          // T-score range is 30-70 (40 points), so divide by 40, not 50
          const pct = Math.round(((aggregatedTscore - 30) / 40) * 100)
          const clampedPercentile = Math.max(0, Math.min(100, pct))
          
          rankings.push({
            schemaId,
            tscore: aggregatedTscore,
            percentile: clampedPercentile,
            item_count: schemaItems.length,
            reliability: Math.round(reliability * 100) / 100,
            rank: 0, // Will be set after sorting
            is_primary: schemaId === selectionResult.primary?.clinical_id,
            is_secondary: schemaId === selectionResult.secondary?.clinical_id,
            is_tertiary: schemaId === selectionResult.tertiary?.clinical_id
          })
        }
      }
      
      // Sort by T-score and assign ranks
      rankings.sort((a, b) => b.tscore - a.tscore)
      rankings.forEach((item, index) => {
        item.rank = index + 1
      })
      
      return rankings
    })() : []

    const lineage: AnalysisLineage = {
      schema_pack_version: schemaPack.version,
      schema_pack_hash: schemaPack.buildHash,
      analysis_version: config.analysis_version,
      instrument: {
        name: validatedPayload.instrument.name,
        version: validatedPayload.instrument.version
      },
      scoring_params: {
        thresholds: SCHEMA_SELECTION_THRESHOLDS,
        tie_rules: selectionResult.tie_breakers_applied,
        normalization_config: 'default' // Could be a hash of the actual config used
      },
      processed_at: new Date().toISOString(),
      processing_duration_ms: processingDuration,
      primary_id: selectionResult.primary?.clinical_id,
      secondary_id: selectionResult.secondary?.clinical_id,
      tertiary_id: selectionResult.tertiary?.clinical_id,
      // Store full schema rankings for visualization
      schema_rankings: fullRankings
    }

    // Add lineage to profile if configured
    if (config.store_lineage) {
      canonicalProfile.analysis_lineage = lineage
      const schemaRankings = lineage.schema_rankings
      console.log(`[BRIDGE_V2] ✅ Analysis lineage added to profile with ${schemaRankings?.length || 0} schema rankings`)
      if (schemaRankings && schemaRankings.length > 0) {
        console.log(`[BRIDGE_V2] 🔬 Schema rankings preview: ${schemaRankings.slice(0, 3).map(s => `${s.schemaId}:T${s.tscore}`).join(', ')}...`)
      }
    } else {
      console.warn(`[BRIDGE_V2] ⚠️ Lineage storage disabled - Schema Rankings will not be available`)
    }

    // STEP 8: Save profile (atomic operation)
    console.log(`[BRIDGE_V2] Step 8: Saving coachee profile`)
    await storeCoacheeProfile(coacheeId, canonicalProfile)

    console.log(`[BRIDGE_V2] ✅ Bridge completed successfully in ${processingDuration}ms`)

    return {
      success: true,
      coachee_id: coacheeId,
      profile_created: true,
      lineage,
      warnings: contentResult.warnings,
      processing_notes: [
        `Successfully bridged assessment for ${clientRecord.firstName} ${clientRecord.lastName}`,
        hasValidPrimary 
          ? `Primary schema: ${selectionResult.primary!.clinical_id} (T${selectionResult.primary!.tscore})`
          : 'Descriptive profile - no schemas meet clinical threshold',
        hasValidPrimary && selectionResult.secondary 
          ? `Secondary schema: ${selectionResult.secondary.clinical_id} (T${selectionResult.secondary.tscore})`
          : hasValidPrimary ? 'No secondary schema' : '',
        hasValidPrimary && selectionResult.tertiary 
          ? `Tertiary schema: ${selectionResult.tertiary.clinical_id} (T${selectionResult.tertiary.tscore})`
          : '',
        `Processing time: ${processingDuration}ms`,
        hasValidPrimary ? `Confidence: ${(selectionResult.confidence * 100).toFixed(1)}%` : 'Schema rankings available for analysis'
      ].filter(note => note !== '') // Remove empty notes
    }

  } catch (error) {
    const processingDuration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error(`[BRIDGE_V2] ❌ Bridge failed after ${processingDuration}ms:`, error)

    return {
      success: false,
      errors: [],
      warnings: [],
      processing_notes: [
        `Bridge transaction failed for coachee: ${coacheeId}`,
        `Error: ${errorMessage}`,
        `Processing time: ${processingDuration}ms`
      ]
    }
  }
}

/**
 * Batch bridge multiple assessments with individual transaction handling
 */
export async function batchBridgeAssessments(
  assessmentClientPairs: Array<{ assessment: any; client: any }>,
  config: BridgeConfig = DEFAULT_BRIDGE_CONFIG
): Promise<{
  success: boolean
  results: Array<BridgeTransactionResult & { client_id: string }>
  summary: {
    total: number
    successful: number
    failed: number
    processing_time_ms: number
  }
}> {
  const startTime = Date.now()
  const results: Array<BridgeTransactionResult & { client_id: string }> = []

  console.log(`[BRIDGE_V2] Batch processing ${assessmentClientPairs.length} assessments`)

  for (let i = 0; i < assessmentClientPairs.length; i++) {
    const { assessment, client } = assessmentClientPairs[i]
    const progress = Math.round(((i + 1) / assessmentClientPairs.length) * 100)
    
    console.log(`[BRIDGE_V2] Processing ${i + 1}/${assessmentClientPairs.length} (${progress}%): ${client.firstName} ${client.lastName}`)

    try {
      const result = await bridgeAssessmentWithHardGating(assessment, client, config)
      results.push({ ...result, client_id: client.id })
      
      if (result.success) {
        console.log(`[BRIDGE_V2] ✅ ${progress}% - Success: ${client.firstName} ${client.lastName}`)
      } else {
        console.error(`[BRIDGE_V2] ❌ ${progress}% - Failed: ${client.firstName} ${client.lastName}`)
      }
      
    } catch (error) {
      console.error(`[BRIDGE_V2] ❌ ${progress}% - Exception: ${client.firstName} ${client.lastName}:`, error)
      results.push({
        success: false,
        client_id: client.id,
        errors: [],
        warnings: [],
        processing_notes: [`Exception during bridge: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    }
  }

  const processingTime = Date.now() - startTime
  const successful = results.filter(r => r.success).length
  const failed = results.length - successful

  console.log(`[BRIDGE_V2] Batch completed: ${successful} successful, ${failed} failed in ${processingTime}ms`)

  return {
    success: successful > 0,
    results,
    summary: {
      total: results.length,
      successful,
      failed,
      processing_time_ms: processingTime
    }
  }
}
