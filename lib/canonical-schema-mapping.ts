
/**
 * CANONICAL SCHEMA MAPPING - Source of Truth
 * This is the authoritative mapping system that eliminates drift between 
 * independent processing and NCP-Studio results by ensuring all components
 * use the same schema identification and mapping logic.
 */

import canonicalMappingData from '@/data/canonical-schema-mapping.json'

export interface CanonicalSchemaMapping {
  section_id: number
  section_name_in_file: string
  domain_canonical: string
  domain_id: string
  variable_id: string
  leadership_persona: string
  healthy_persona: string
  clinical_label_in_file: string
  clinical_schema_canonical: string
  clinical_id: string
  leadership_id: string
}

// Load canonical mapping data
const CANONICAL_MAPPINGS: CanonicalSchemaMapping[] = canonicalMappingData

/**
 * Get canonical mapping by variable ID (e.g., "1.1", "2.3")
 */
export function getCanonicalMappingByVariableId(variableId: string): CanonicalSchemaMapping | null {
  return CANONICAL_MAPPINGS.find(mapping => mapping.variable_id === variableId) || null
}

/**
 * Get canonical mapping by clinical ID (e.g., "abandonment_instability")
 */
export function getCanonicalMappingByClinicalId(clinicalId: string): CanonicalSchemaMapping | null {
  return CANONICAL_MAPPINGS.find(mapping => mapping.clinical_id === clinicalId) || null
}

/**
 * Get canonical mapping by clinical label in file (e.g., "Abandonment")
 */
export function getCanonicalMappingByClinicalLabel(clinicalLabel: string): CanonicalSchemaMapping | null {
  return CANONICAL_MAPPINGS.find(mapping => 
    mapping.clinical_label_in_file.toLowerCase() === clinicalLabel.toLowerCase() ||
    mapping.clinical_schema_canonical.toLowerCase() === clinicalLabel.toLowerCase()
  ) || null
}

/**
 * Convert variable ID to canonical clinical ID
 */
export function variableIdToClinicalId(variableId: string): string | null {
  const mapping = getCanonicalMappingByVariableId(variableId)
  return mapping?.clinical_id || null
}

/**
 * Convert clinical label to canonical clinical ID
 */
export function clinicalLabelToClinicalId(clinicalLabel: string): string | null {
  const mapping = getCanonicalMappingByClinicalLabel(clinicalLabel)
  return mapping?.clinical_id || null
}

/**
 * Get leadership persona for clinical ID
 */
export function getLeadershipPersonaByClinicalId(clinicalId: string): {
  leadership_persona: string
  healthy_persona: string
  leadership_id: string
} | null {
  const mapping = getCanonicalMappingByClinicalId(clinicalId)
  return mapping ? {
    leadership_persona: mapping.leadership_persona,
    healthy_persona: mapping.healthy_persona,
    leadership_id: mapping.leadership_id
  } : null
}

/**
 * Get domain information for clinical ID
 */
export function getDomainInfoByClinicalId(clinicalId: string): {
  domain_canonical: string
  domain_id: string
  section_id: number
} | null {
  const mapping = getCanonicalMappingByClinicalId(clinicalId)
  return mapping ? {
    domain_canonical: mapping.domain_canonical,
    domain_id: mapping.domain_id,
    section_id: mapping.section_id
  } : null
}

/**
 * Get all canonical mappings grouped by domain
 */
export function getCanonicalMappingsByDomain(): Record<string, CanonicalSchemaMapping[]> {
  const domains: Record<string, CanonicalSchemaMapping[]> = {}
  
  CANONICAL_MAPPINGS.forEach(mapping => {
    if (!domains[mapping.domain_id]) {
      domains[mapping.domain_id] = []
    }
    domains[mapping.domain_id].push(mapping)
  })
  
  return domains
}

/**
 * Get variable ID to clinical ID mapping for assessment processing
 */
export function getVariableToClinicalMapping(): Record<string, string> {
  const mapping: Record<string, string> = {}
  
  CANONICAL_MAPPINGS.forEach(canonicalMapping => {
    mapping[canonicalMapping.variable_id] = canonicalMapping.clinical_id
  })
  
  return mapping
}

/**
 * Validate if a clinical ID exists in canonical mapping
 */
export function isValidCanonicalClinicalId(clinicalId: string): boolean {
  return CANONICAL_MAPPINGS.some(mapping => mapping.clinical_id === clinicalId)
}

/**
 * Get all valid canonical clinical IDs
 */
export function getAllCanonicalClinicalIds(): string[] {
  return CANONICAL_MAPPINGS.map(mapping => mapping.clinical_id)
}

export default CANONICAL_MAPPINGS
