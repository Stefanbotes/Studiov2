
/**
 * IMMUTABLE CONTRACTS - QA Implementation
 * Edge-validated at the boundary with deterministic processing rules
 */

import { z } from "zod"

// A. Canonical Schema IDs (all 18 schemas exactly)
export const CANONICAL_SCHEMA_IDS = [
  'abandonment_instability',
  'mistrust_abuse', 
  'emotional_deprivation',
  'social_isolation_alienation',
  'defectiveness_shame',
  'failure',
  'dependence_incompetence',
  'vulnerability_to_harm_illness',
  'enmeshment_undeveloped_self',
  'subjugation',
  'self_sacrifice',
  'emotional_inhibition',
  'unrelenting_standards_hypercriticalness',
  'entitlement_grandiosity',
  'insufficient_self_control_discipline',
  'approval_seeking_recognition_seeking',
  'negativity_pessimism',
  'punitiveness'
] as const

export type CanonicalId = typeof CANONICAL_SCHEMA_IDS[number]

// Validation schema for canonical IDs
const CanonicalIdSchema = z.enum(CANONICAL_SCHEMA_IDS)

// Import Payload Schema (immutable contract)
export const ImportPayloadSchema = z.object({
  schemaVersion: z.string().regex(/^1\.\d+$/, "Must be version 1.x"), // version of this contract
  instrument: z.object({
    name: z.string().min(1),
    version: z.string().min(1)
  }),
  respondent: z.object({ 
    id: z.string().min(1)
  }),
  assessment: z.object({
    assessmentId: z.string().min(1),
    completedAt: z.string().datetime() // ISO datetime
  }),
  items: z.array(z.object({
    schema_id: CanonicalIdSchema, // e.g., "emotional_deprivation"
    raw: z.number().optional(),
    tscore: z.number().optional(), // preferred if present
    percentile: z.number().optional(),
    reverse: z.boolean().optional().default(false),
    weight: z.number().positive().optional().default(1)
  })).min(1, "Must have at least one item")
}).strict()

export type ImportPayload = z.infer<typeof ImportPayloadSchema>

// Normalization configuration
export interface NormalizationConfig {
  // Instrument-specific raw to tscore conversion tables
  instrumentConversionTables: Record<string, {
    [rawScore: number]: number // raw -> tscore
  }>
  
  // Fixed percentile to tscore lookup table
  percentileToTscoreLUT: Record<number, number>
  
  // Supported instruments and their priorities
  instrumentPriority: Record<string, number>
}

// Primary/Secondary/Tertiary Selection Thresholds (deterministic)
export const SCHEMA_SELECTION_THRESHOLDS = {
  PRIMARY_MIN: 60, // T60 minimum for primary
  SECONDARY_MIN: 50, // T50 minimum for secondary (allow emerging patterns)
  TERTIARY_MIN: 50, // T50 minimum for tertiary (same as secondary)
  MAX_SECONDARY_DELTA: 12, // Within 12 T-points of primary (more flexible)
  MAX_TERTIARY_DELTA: 15 // Within 15 T-points of primary (slightly more flexible than secondary)
} as const

// Tie-breaker rules (in order of precedence)
export type TieBreakerRule = 
  | 'higher_tscore'
  | 'higher_reliability' 
  | 'higher_item_count'
  | 'instrument_priority'
  | 'lexicographic_canonical_id'

export const TIE_BREAKER_ORDER: TieBreakerRule[] = [
  'higher_tscore',
  'higher_reliability', 
  'higher_item_count',
  'instrument_priority',
  'lexicographic_canonical_id'
]

// Schema Selection Result
export interface SchemaSelectionResult {
  primary?: {
    clinical_id: CanonicalId
    tscore: number
    reliability: number
    item_count: number
    instrument: string
  }
  secondary?: {
    clinical_id: CanonicalId
    tscore: number
    reliability: number
    item_count: number
    instrument: string
  }
  tertiary?: {
    clinical_id: CanonicalId
    tscore: number
    reliability: number
    item_count: number
    instrument: string
  }
  confidence: number
  selection_notes: string[]
  tie_breakers_applied: TieBreakerRule[]
}

// Content Resolution Requirements
export const REQUIRED_CLINICAL_VERTICALS = [
  'Core_Needs_Frustrated',
  'Typical_Developmental_Window', 
  'Attachment_Correlates',
  'Developmental_Pathways',
  'Neurocognitive_Correlates',
  'Memory_Systems',
  'Regulatory_Profile',
  'Maintaining_Biases',
  'Testable_Predictions',
  'Primary_Thought',
  'Primary_Emotion', 
  'Primary_Belief',
  'Primary_Bodily_Anchor',
  'Recognized_Variants',
  'Mode_Surrender',
  'Mode_Avoidance',
  'Mode_Overcompensation', 
  'Key_Moderators',
  'Core_Threat_Signal',
  'Primary_Defenses(Base-Rate)',
  'Surrender_Mode_Defenses',
  'Avoidance_Mode_Defenses',
  'Overcompensation_Mode_Defenses',
  'Vaillant_Levels_Typically_Engaged',
  'Defensive_Function(Anxiety_Avoided)',
  'Notes/Discriminators'
] as const

export const REQUIRED_LEADERSHIP_VERTICALS = [
  'unmet_need',
  'surrender_behavior',
  'avoidance_behavior', 
  'overcompensation_behavior',
  'maladaptive_modes',
  'healthy_mode',
  'leadership_persona',
  'healthy_persona',
  'reflection_statement_1',
  'reflection_statement_2',
  'reflection_statement_3',
  'leadership_behavior_markers',
  'impact_on_team',
  'decision_making_style',
  'lios_interpretation'
] as const

// Content Completeness Error
export interface ContentCompletenessError {
  schema_id: CanonicalId
  missing_clinical_verticals: string[]
  missing_leadership_verticals: string[]
  error_type: 'incomplete_clinical' | 'incomplete_leadership' | 'incomplete_both'
}

// Version & Lineage Tracking
export interface AnalysisLineage {
  schema_pack_version: string
  schema_pack_hash: string
  analysis_version: string // e.g., "bridge@2.1.0"
  instrument: {
    name: string
    version: string
  }
  scoring_params: {
    thresholds: typeof SCHEMA_SELECTION_THRESHOLDS
    tie_rules: TieBreakerRule[]
    normalization_config: string // hash of config used
  }
  processed_at: string // ISO timestamp
  processing_duration_ms: number
  // Selected schema IDs for quick reference
  primary_id?: CanonicalId
  secondary_id?: CanonicalId
  tertiary_id?: CanonicalId
  // Full schema rankings for visualization
  schema_rankings?: Array<{
    schemaId: string
    tscore: number
    percentile: number
    item_count: number
    reliability: number
    rank: number
    is_primary: boolean
    is_secondary: boolean
    is_tertiary: boolean
  }>
}

// Bridge Transaction Result
export interface BridgeTransactionResult {
  success: boolean
  coachee_id?: string
  profile_created?: boolean
  profile_updated?: boolean
  lineage?: AnalysisLineage
  errors?: ContentCompletenessError[]
  warnings?: string[]
  processing_notes?: string[]
}

// Canonical ID to Leadership ID mapping (1:1)
export const CLINICAL_TO_LEADERSHIP_MAPPING: Record<CanonicalId, string> = {
  'abandonment_instability': 'abandonment_instability',
  'mistrust_abuse': 'mistrust_abuse',
  'emotional_deprivation': 'emotional_deprivation',
  'social_isolation_alienation': 'social_isolation_alienation', 
  'defectiveness_shame': 'defectiveness_shame',
  'failure': 'failure',
  'dependence_incompetence': 'dependence_incompetence',
  'vulnerability_to_harm_illness': 'vulnerability_to_harm_illness',
  'enmeshment_undeveloped_self': 'enmeshment_undeveloped_self',
  'subjugation': 'subjugation',
  'self_sacrifice': 'self_sacrifice',
  'emotional_inhibition': 'emotional_inhibition',
  'unrelenting_standards_hypercriticalness': 'unrelenting_standards_hypercriticalness',
  'entitlement_grandiosity': 'entitlement_grandiosity',
  'insufficient_self_control_discipline': 'insufficient_self_control_discipline',
  'approval_seeking_recognition_seeking': 'approval_seeking_recognition_seeking',
  'negativity_pessimism': 'negativity_pessimism',
  'punitiveness': 'punitiveness'
}

export { ImportPayloadSchema as ImportSchema }
