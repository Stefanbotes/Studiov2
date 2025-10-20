
/**
 * CANONICAL CONTENT RESOLVER - QA Implementation
 * Never guesses - fails closed when content is incomplete
 */

import { 
  CanonicalId,
  CLINICAL_TO_LEADERSHIP_MAPPING,
  REQUIRED_CLINICAL_VERTICALS,
  REQUIRED_LEADERSHIP_VERTICALS,
  ContentCompletenessError
} from '@/lib/types/immutable-contracts'

export interface SchemaContent {
  clinical?: Record<string, any>
  leadership?: Record<string, any>
}

export interface ContentResolutionResult {
  success: boolean
  resolved_content?: {
    clinical: Record<string, Record<string, any>>
    leadership: Record<string, Record<string, any>>
  }
  completeness_errors: ContentCompletenessError[]
  warnings: string[]
}

// Single mapping table (1:1 clinical_id → leadership_id)
const SCHEMA_MAPPING = CLINICAL_TO_LEADERSHIP_MAPPING

/**
 * Resolve canonical content for selected schemas
 * Fails closed if any required vertical is missing
 */
export async function resolveCanonicalContent(
  schemaIds: CanonicalId[],
  schemaPack: any
): Promise<ContentResolutionResult> {
  console.log(`[CONTENT_RESOLVER] Resolving content for schemas: ${schemaIds.join(', ')}`)

  const result: ContentResolutionResult = {
    success: true,
    completeness_errors: [],
    warnings: []
  }

  const resolvedClinical: Record<string, Record<string, any>> = {}
  const resolvedLeadership: Record<string, Record<string, any>> = {}

  for (const clinicalId of schemaIds) {
    console.log(`[CONTENT_RESOLVER] Processing schema: ${clinicalId}`)

    // Get leadership mapping
    const leadershipId = SCHEMA_MAPPING[clinicalId]
    if (!leadershipId) {
      result.completeness_errors.push({
        schema_id: clinicalId,
        missing_clinical_verticals: [],
        missing_leadership_verticals: [],
        error_type: 'incomplete_both'
      })
      result.warnings.push(`No leadership mapping found for clinical schema: ${clinicalId}`)
      continue
    }

    // Validate clinical content
    const clinicalContent = schemaPack.schemas?.[clinicalId]?.clinical?.primary
    const clinicalValidation = validateClinicalContent(clinicalId, clinicalContent)

    // Validate leadership content  
    const leadershipContent = schemaPack.schemas?.[clinicalId]?.leadership?.primary
    const leadershipValidation = validateLeadershipContent(clinicalId, leadershipContent)

    // Check if content is complete
    if (clinicalValidation.missing.length > 0 || leadershipValidation.missing.length > 0) {
      const errorType = clinicalValidation.missing.length > 0 && leadershipValidation.missing.length > 0
        ? 'incomplete_both'
        : clinicalValidation.missing.length > 0 
          ? 'incomplete_clinical' 
          : 'incomplete_leadership'

      result.completeness_errors.push({
        schema_id: clinicalId,
        missing_clinical_verticals: clinicalValidation.missing,
        missing_leadership_verticals: leadershipValidation.missing,
        error_type: errorType
      })

      console.error(`[CONTENT_RESOLVER] ❌ Incomplete content for ${clinicalId}:`)
      console.error(`[CONTENT_RESOLVER] - Clinical missing: ${clinicalValidation.missing.join(', ')}`)  
      console.error(`[CONTENT_RESOLVER] - Leadership missing: ${leadershipValidation.missing.join(', ')}`)
      continue
    }

    // Content is complete - include it
    resolvedClinical[clinicalId] = clinicalContent
    resolvedLeadership[leadershipId] = leadershipContent

    console.log(`[CONTENT_RESOLVER] ✅ Complete content resolved for ${clinicalId}`)
  }

  // Fail if any schema has incomplete content
  if (result.completeness_errors.length > 0) {
    result.success = false
    console.error(`[CONTENT_RESOLVER] ❌ Content resolution failed: ${result.completeness_errors.length} schemas with incomplete content`)
  } else {
    result.resolved_content = {
      clinical: resolvedClinical,
      leadership: resolvedLeadership  
    }
    console.log(`[CONTENT_RESOLVER] ✅ All content validated and resolved successfully`)
  }

  return result
}

/**
 * Validate clinical content has all required verticals
 */
function validateClinicalContent(
  schemaId: CanonicalId, 
  content: any
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!content || typeof content !== 'object') {
    return { valid: false, missing: [...REQUIRED_CLINICAL_VERTICALS] }
  }

  for (const vertical of REQUIRED_CLINICAL_VERTICALS) {
    if (!(vertical in content) || content[vertical] === undefined || content[vertical] === null) {
      missing.push(vertical)
    }
    // Additional check for empty strings/arrays
    else if (
      (typeof content[vertical] === 'string' && content[vertical].trim() === '') ||
      (Array.isArray(content[vertical]) && content[vertical].length === 0)
    ) {
      missing.push(vertical)
    }
  }

  return { valid: missing.length === 0, missing }
}

/**
 * Validate leadership content has all required verticals
 */
function validateLeadershipContent(
  schemaId: CanonicalId,
  content: any
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!content || typeof content !== 'object') {
    return { valid: false, missing: [...REQUIRED_LEADERSHIP_VERTICALS] }
  }

  for (const vertical of REQUIRED_LEADERSHIP_VERTICALS) {
    if (!(vertical in content) || content[vertical] === undefined || content[vertical] === null) {
      missing.push(vertical)
    }
    // Additional check for empty strings/arrays
    else if (
      (typeof content[vertical] === 'string' && content[vertical].trim() === '') ||
      (Array.isArray(content[vertical]) && content[vertical].length === 0)
    ) {
      missing.push(vertical)
    }
  }

  return { valid: missing.length === 0, missing }
}

/**
 * Generate detailed error report for incomplete content
 */
export function generateContentErrorReport(errors: ContentCompletenessError[]): string {
  if (errors.length === 0) {
    return 'No content completeness errors found.'
  }

  const lines: string[] = [
    '🚨 CONTENT COMPLETENESS ERRORS:',
    ''
  ]

  for (const error of errors) {
    lines.push(`Schema: ${error.schema_id}`)
    lines.push(`Error Type: ${error.error_type}`)
    
    if (error.missing_clinical_verticals.length > 0) {
      lines.push(`Missing Clinical Verticals (${error.missing_clinical_verticals.length}):`)
      error.missing_clinical_verticals.forEach(vertical => {
        lines.push(`  - ${vertical}`)
      })
    }

    if (error.missing_leadership_verticals.length > 0) {
      lines.push(`Missing Leadership Verticals (${error.missing_leadership_verticals.length}):`)
      error.missing_leadership_verticals.forEach(vertical => {
        lines.push(`  - ${vertical}`)
      })
    }
    
    lines.push('')
  }

  lines.push('❌ Profile creation/update aborted due to incomplete atlas data.')
  lines.push('✅ Ensure all required verticals are present in the schema pack before proceeding.')

  return lines.join('\n')
}

/**
 * Load schema pack with validation
 */
export async function loadValidatedSchemaPack(): Promise<any> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    
    const schemaPackPath = path.join(process.cwd(), 'data', 'schema-pack.json')
    
    if (!fs.existsSync(schemaPackPath)) {
      throw new Error('Schema pack file not found: data/schema-pack.json')
    }

    const schemaPackContent = fs.readFileSync(schemaPackPath, 'utf-8')
    const schemaPack = JSON.parse(schemaPackContent)

    if (!schemaPack.schemas || typeof schemaPack.schemas !== 'object') {
      throw new Error('Invalid schema pack: missing schemas object')
    }

    console.log(`[CONTENT_RESOLVER] Loaded schema pack v${schemaPack.version} with ${Object.keys(schemaPack.schemas).length} schemas`)
    
    return schemaPack
  } catch (error) {
    console.error('[CONTENT_RESOLVER] Failed to load schema pack:', error)
    throw error
  }
}
