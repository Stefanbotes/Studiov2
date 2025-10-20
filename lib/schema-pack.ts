
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface SchemaPackData {
  version: string
  buildHash: string
  generatedAt: string
  schemaCount: number
  sourceFiles: string[]
  schemas: {
    [schemaId: string]: {
      leadership: {
        primary?: any
        secondary?: any
      }
      clinical: {
        primary?: any
        secondary?: any
      }
      metadata: {
        updated_at: string
        source_files: string[]
      }
    }
  }
}

let cachedSchemaPack: SchemaPackData | null = null

/**
 * Load and cache the schema pack data
 */
export function getSchemaPackData(): SchemaPackData | null {
  if (cachedSchemaPack) {
    return cachedSchemaPack
  }
  
  try {
    const schemaPackPath = join(process.cwd(), 'data', 'schema-pack.json')
    
    if (!existsSync(schemaPackPath)) {
      console.warn('⚠️  Schema pack not found. Run build script first.')
      return null
    }
    
    const content = readFileSync(schemaPackPath, 'utf8')
    const data = JSON.parse(content) as SchemaPackData
    
    cachedSchemaPack = data
    return data
    
  } catch (error) {
    console.error('❌ Error loading schema pack:', error)
    return null
  }
}

/**
 * Get schema data for a specific schema ID
 */
export function getSchemaById(schemaId: string) {
  const pack = getSchemaPackData()
  if (!pack || !pack.schemas[schemaId]) {
    return null
  }
  
  return pack.schemas[schemaId]
}

/**
 * Get available schema IDs
 */
export function getAvailableSchemaIds(): string[] {
  const pack = getSchemaPackData()
  return pack ? Object.keys(pack.schemas) : []
}

/**
 * Get leadership workflow data from schema
 */
export function getLeadershipWorkflowData(schemaId: string) {
  const schema = getSchemaById(schemaId)
  if (!schema) return null
  
  const primary = schema.leadership.primary || {}
  const secondary = schema.leadership.secondary || {}
  
  // Map Excel data to workflow sections using actual field names
  return {
    schema_name: primary.schema_name_clinical || '',
    schema_domain: primary.schema_domain || '',
    tier2_name: primary.schema_name_tier2 || '',
    unmet_need: primary.unmet_need || '',
    surrender_behavior: primary.surrender_behavior || '',
    avoidance_behavior: primary.avoidance_behavior || '',
    overcompensation_behavior: primary.overcompensation_behavior || '',
    maladaptive_modes: primary.maladaptive_modes || '',
    healthy_mode: primary.healthy_mode || '',
    leadership_persona: primary.leadership_persona || '',
    healthy_persona: primary.healthy_persona || '',
    reflection_statement_1: primary.reflection_statement_1 || '',
    reflection_statement_2: primary.reflection_statement_2 || '',
    reflection_statement_3: primary.reflection_statement_3 || '',
    leadership_behavior_markers: primary.leadership_behavior_markers || '',
    impact_on_team: primary.impact_on_team || '',
    decision_making_style: primary.decision_making_style || '',
    lios_interpretation: primary.lios_interpretation || '',
    growth_levers: primary.growth_levers || '',
    // Secondary data if available
    ...secondary
  }
}

/**
 * Get clinical workflow data from schema
 */
export function getClinicalWorkflowData(schemaId: string) {
  const schema = getSchemaById(schemaId)
  if (!schema) return null
  
  const primary = schema.clinical.primary || {}
  const secondary = schema.clinical.secondary || {}
  
  // Map Excel data to clinical workflow sections using actual field names
  return {
    schema_name: primary.schema_name_clinical || '',
    schema_domain: primary.schema_domain || '',
    core_needs: primary.Core_Needs_Frustrated || '',
    dev_window: primary.Typical_Developmental_Window || '',
    attachment: primary.Attachment_Correlates || '',
    pathways: primary.Developmental_Pathways || '',
    neuro: primary.Neurocognitive_Correlates || '',
    memory: primary.Memory_Systems || primary.memory_systems || '',
    regulatory: primary.Regulatory_Profile || primary.regulatory_profile || '',
    biases: primary.Maintaining_Biases || primary.maintaining_biases || '',
    predictions: primary.Testable_Predictions || '',
    thought: primary.Primary_Thought || '',
    emotion: primary.Primary_Emotion || '',
    belief: primary.Primary_Belief || '',
    bodily: primary.Primary_Bodily_Anchor || '',
    variants: primary.Recognized_Variants || '',
    surrender_mode: primary.Mode_Surrender || '',
    avoidance_mode: primary.Mode_Avoidance || '',
    overcomp_mode: primary.Mode_Overcompensation || '',
    moderators: primary.Key_Moderators || '',
    threat: primary.Core_Threat_Signal || '',
    defenses: primary['Primary_Defenses(Base-Rate)'] || '',
    surrender_def: primary.Surrender_Mode_Defenses || '',
    avoidance_def: primary.Avoidance_Mode_Defenses || '',
    overcomp_def: primary.Overcompensation_Mode_Defenses || '',
    vaillant: primary.Vaillant_Levels_Typically_Engaged || '',
    function: primary['Defensive_Function(Anxiety_Avoided)'] || '',
    notes: primary['Notes/Discriminators'] || '',
    // Secondary data if available  
    ...secondary
  }
}

/**
 * Clear cache (useful for development)
 */
export function clearSchemaPackCache() {
  cachedSchemaPack = null
}
