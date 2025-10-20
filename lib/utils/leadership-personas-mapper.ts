
/**
 * Leadership Personas Assessment Mapper - CANONICAL VERSION
 * Uses canonical schema mapping to eliminate drift between independent processing and NCP-Studio
 */

import { getVariableToClinicalMapping, getCanonicalMappingByVariableId, getCanonicalMappingByClinicalId } from '@/lib/canonical-schema-mapping'

export interface PersonaMapping {
  id: string
  name: string
  persona: string
  healthyPersona: string
  schemaMapping: string // Maps to NCP schema system
  questions: {
    id: string
    type: string
    text: string
  }[]
}

// CANONICAL MAPPING: Variable ID to Clinical ID (from canonical-schema-mapping.json)
// This ensures NCP-Studio uses the EXACT same mappings as independent processing
export const LEADERSHIP_PERSONAS_TO_NCP_SCHEMA: Record<string, string> = getVariableToClinicalMapping()

/**
 * Convert assessment response using Leadership Personas structure - CANONICAL VERSION
 * Uses canonical schema mapping to ensure consistent processing with independent workflow
 */
export function mapLeadershipPersonasToNCP(assessmentData: any): Record<string, number> {
  console.log(`[CANONICAL_PERSONAS_MAPPER] Processing Leadership Personas assessment using canonical mapping`)
  
  const schemaScores: Record<string, number[]> = {}
  let mappedCount = 0
  let skippedCount = 0
  
  // Process responses from your assessment structure
  Object.entries(assessmentData.responses || {}).forEach(([questionId, value]) => {
    // Extract persona ID (e.g., "1.1.R1" -> "1.1")
    const personaId = questionId.split('.').slice(0, 2).join('.')
    
    // Get corresponding NCP schema using CANONICAL mapping
    const ncpSchema = LEADERSHIP_PERSONAS_TO_NCP_SCHEMA[personaId]
    const canonicalMapping = getCanonicalMappingByVariableId(personaId)
    
    if (ncpSchema && typeof value === 'number' && canonicalMapping) {
      if (!schemaScores[ncpSchema]) {
        schemaScores[ncpSchema] = []
      }
      schemaScores[ncpSchema].push(value)
      console.log(`[CANONICAL_PERSONAS_MAPPER] ${questionId} (${personaId}) -> ${ncpSchema} [${canonicalMapping.leadership_persona}]: ${value}`)
      mappedCount++
    } else {
      console.warn(`[CANONICAL_PERSONAS_MAPPER] No canonical mapping found for persona ${personaId} (question: ${questionId})`)
      skippedCount++
    }
  })
  
  console.log(`[CANONICAL_PERSONAS_MAPPER] Processing complete: ${mappedCount} mapped, ${skippedCount} skipped`)
  
  // Calculate average scores for each schema
  const finalScores: Record<string, number> = {}
  Object.entries(schemaScores).forEach(([schema, scores]) => {
    finalScores[schema] = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const canonicalMapping = getCanonicalMappingByClinicalId(schema)
    const displayName = canonicalMapping ? canonicalMapping.clinical_schema_canonical : schema
    console.log(`[CANONICAL_PERSONAS_MAPPER] Final score for ${schema} [${displayName}]: ${finalScores[schema].toFixed(2)} (${scores.length} items)`)
  })
  
  return finalScores
}
