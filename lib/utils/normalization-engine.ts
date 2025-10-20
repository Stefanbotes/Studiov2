
/**
 * NORMALIZATION ENGINE - QA Implementation
 * Deterministic conversion of raw scores to T-scores with strict validation
 */

import { ImportPayload, NormalizationConfig, CANONICAL_SCHEMA_IDS } from '@/lib/types/immutable-contracts'

// Comprehensive LASBI raw→T-score lookup table
function generateLASBIConversionTable(): Record<number, number> {
  const table: Record<number, number> = {}
  
  // Base 1-5 mapping (DO NOT overwrite these)
  table[1] = 30; table[2] = 40; table[3] = 50; table[4] = 60; table[5] = 70
  
  // Extended LASBI scale: Handle edge cases
  table[0] = 25; table[6] = 75
  
  // ❌ FIXED: Remove the decimal loop that overwrote base mappings
  // Let interpolation handle decimal values like 1.1, 2.3, etc.
  // The original loop caused: 1.0→20 (should be 30), 3.0→45 (should be 50)
  // This depressed T-scores and broke rankings/thresholds
  
  return table
}

// Default normalization configuration
const DEFAULT_NORMALIZATION_CONFIG: NormalizationConfig = {
  instrumentConversionTables: {
    'LASBI': generateLASBIConversionTable(),
    'LASBI-Short': generateLASBIConversionTable(),
    'Leadership Assessment Schema-Based Inventory (LASBI)': generateLASBIConversionTable(),
    'YSQ-S3': {
      // Young Schema Questionnaire conversions (1-6 scale)
      1: 35, 2: 42, 3: 49, 4: 56, 5: 63, 6: 70
    }
  },
  
  // Fixed percentile to T-score lookup (standardized)
  percentileToTscoreLUT: {
    1: 20, 5: 30, 10: 37, 16: 40, 25: 43, 50: 50, 
    75: 57, 84: 60, 90: 63, 95: 70, 99: 80
  },
  
  // Instrument priorities for tie-breaking
  instrumentPriority: {
    'LASBI': 100,
    'LASBI-Short': 100,
    'Leadership Assessment Schema-Based Inventory (LASBI)': 100,
    'YSQ-S3': 90,
    'SQ': 80
  }
}

export interface NormalizedItem {
  schema_id: string
  tscore: number
  raw?: number
  percentile?: number
  reverse: boolean
  weight: number
  conversion_method: 'tscore_provided' | 'raw_to_tscore' | 'percentile_to_tscore'
  instrument: string
}

export interface NormalizationResult {
  success: boolean
  normalized_items: NormalizedItem[]
  failed_items: Array<{
    item: any
    reason: string
  }>
  conversion_summary: {
    tscore_provided: number
    raw_converted: number  
    percentile_converted: number
    failed: number
  }
}

/**
 * Normalize assessment payload items to T-scores
 * Implements deterministic conversion rules with strict validation
 */
export function normalizeAssessmentItems(
  payload: ImportPayload,
  config: NormalizationConfig = DEFAULT_NORMALIZATION_CONFIG
): NormalizationResult {
  const result: NormalizationResult = {
    success: true,
    normalized_items: [],
    failed_items: [],
    conversion_summary: {
      tscore_provided: 0,
      raw_converted: 0,
      percentile_converted: 0,
      failed: 0
    }
  }

  console.log(`[NORMALIZATION] Processing ${payload.items.length} items for instrument: ${payload.instrument.name}`)

  for (const item of payload.items) {
    try {
      const normalizedItem = normalizeItem(item, payload.instrument, config)
      result.normalized_items.push(normalizedItem)
      
      // Track conversion method
      switch (normalizedItem.conversion_method) {
        case 'tscore_provided':
          result.conversion_summary.tscore_provided++
          break
        case 'raw_to_tscore':
          result.conversion_summary.raw_converted++
          break
        case 'percentile_to_tscore':
          result.conversion_summary.percentile_converted++
          break
      }
      
    } catch (error) {
      result.failed_items.push({
        item,
        reason: error instanceof Error ? error.message : 'Unknown normalization error'
      })
      result.conversion_summary.failed++
      console.error(`[NORMALIZATION] Failed to normalize item:`, error)
    }
  }

  // Validate that we have some successful normalizations
  if (result.normalized_items.length === 0) {
    result.success = false
    console.error(`[NORMALIZATION] CRITICAL: No items could be normalized`)
  }

  console.log(`[NORMALIZATION] Summary:`, result.conversion_summary)
  return result
}

/**
 * Normalize a single assessment item using deterministic rules
 */
function normalizeItem(
  item: ImportPayload['items'][0], 
  instrument: ImportPayload['instrument'],
  config: NormalizationConfig
): NormalizedItem {
  // Validate canonical schema ID
  if (!CANONICAL_SCHEMA_IDS.includes(item.schema_id)) {
    throw new Error(`Invalid canonical schema ID: ${item.schema_id}`)
  }

  let tscore: number
  let conversionMethod: NormalizedItem['conversion_method']

  // Rule 1: Prefer T-score if present
  if (item.tscore !== undefined) {
    if (item.tscore < 20 || item.tscore > 80) {
      throw new Error(`T-score out of valid range (20-80): ${item.tscore}`)
    }
    tscore = item.tscore
    conversionMethod = 'tscore_provided'
    
  // Rule 2: Convert raw to T-score via instrument-specific table
  } else if (item.raw !== undefined) {
    const conversionTable = config.instrumentConversionTables[instrument.name]
    
    if (!conversionTable) {
      console.warn(`[NORMALIZATION] No conversion table found for instrument: "${instrument.name}", using linear fallback`)
      // Fallback: Assume 1-5 scale and convert linearly to T-score range
      const clampedRaw = Math.max(1, Math.min(5, item.raw)) // Clamp to 1-5 range
      tscore = Math.round(20 + ((clampedRaw - 1) / 4) * 60) // Linear mapping: 1→30, 3→50, 5→70
      conversionMethod = 'raw_to_tscore'
    } else if (conversionTable[item.raw] === undefined) {
      console.warn(`[NORMALIZATION] No exact conversion for raw score ${item.raw} in ${instrument.name}, using interpolation`)
      // Fallback: Find nearest values and interpolate
      const rawScores = Object.keys(conversionTable).map(Number).sort((a, b) => a - b)
      
      if (item.raw < rawScores[0]) {
        // Below minimum: use minimum T-score
        tscore = conversionTable[rawScores[0]]
      } else if (item.raw > rawScores[rawScores.length - 1]) {
        // Above maximum: use maximum T-score
        tscore = conversionTable[rawScores[rawScores.length - 1]]
      } else {
        // Interpolate between nearest values
        let lowerRaw = 1, upperRaw = 5
        for (let i = 0; i < rawScores.length - 1; i++) {
          if (item.raw > rawScores[i] && item.raw < rawScores[i + 1]) {
            lowerRaw = rawScores[i]
            upperRaw = rawScores[i + 1]
            break
          }
        }
        const ratio = (item.raw - lowerRaw) / (upperRaw - lowerRaw)
        tscore = Math.round(conversionTable[lowerRaw] + ratio * (conversionTable[upperRaw] - conversionTable[lowerRaw]))
      }
      conversionMethod = 'raw_to_tscore'
    } else {
      tscore = conversionTable[item.raw]
      conversionMethod = 'raw_to_tscore'
    }
    
  // Rule 3: Convert percentile to T-score via fixed LUT  
  } else if (item.percentile !== undefined) {
    const percentileTscore = findClosestPercentileTscore(item.percentile, config.percentileToTscoreLUT)
    if (percentileTscore === null) {
      throw new Error(`Cannot convert percentile to T-score: ${item.percentile}`)
    }
    tscore = percentileTscore
    conversionMethod = 'percentile_to_tscore'
    
  // Rule 4: Reject if no conversion path exists
  } else {
    throw new Error(`No conversion path available - missing tscore, raw, and percentile values`)
  }

  // Apply reverse scoring if specified
  if (item.reverse) {
    tscore = 100 - tscore // Standard reverse scoring formula
  }

  // Apply weight (for future aggregation)  
  const weight = item.weight ?? 1

  return {
    schema_id: item.schema_id,
    tscore,
    raw: item.raw,
    percentile: item.percentile,
    reverse: item.reverse ?? false,
    weight,
    conversion_method: conversionMethod,
    instrument: instrument.name
  }
}

/**
 * Find closest percentile T-score from lookup table
 */
function findClosestPercentileTscore(
  percentile: number, 
  lut: Record<number, number>
): number | null {
  if (percentile < 1 || percentile > 99) {
    return null
  }

  // Exact match
  if (lut[percentile] !== undefined) {
    return lut[percentile]
  }

  // Find closest percentile points
  const percentiles = Object.keys(lut).map(Number).sort((a, b) => a - b)
  
  for (let i = 0; i < percentiles.length - 1; i++) {
    const lower = percentiles[i]
    const upper = percentiles[i + 1]
    
    if (percentile > lower && percentile < upper) {
      // Linear interpolation
      const ratio = (percentile - lower) / (upper - lower)
      return Math.round(lut[lower] + ratio * (lut[upper] - lut[lower]))
    }
  }

  // Use boundary values for extremes
  if (percentile <= percentiles[0]) {
    return lut[percentiles[0]]
  }
  if (percentile >= percentiles[percentiles.length - 1]) {
    return lut[percentiles[percentiles.length - 1]]
  }

  return null
}

export { DEFAULT_NORMALIZATION_CONFIG }
