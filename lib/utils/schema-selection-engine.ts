
/**
 * SCHEMA SELECTION ENGINE - QA Implementation  
 * Deterministic, explainable primary/secondary selection with clinical thresholds
 */

import { 
  CanonicalId, 
  SchemaSelectionResult, 
  TieBreakerRule, 
  TIE_BREAKER_ORDER,
  SCHEMA_SELECTION_THRESHOLDS 
} from '@/lib/types/immutable-contracts'
import { NormalizedItem } from './normalization-engine'
import { thresholds } from '@/config/thresholds'

export interface SchemaCandidate {
  clinical_id: CanonicalId
  tscore: number
  reliability: number
  item_count: number
  instrument: string
  items: NormalizedItem[]
}

/**
 * Select primary, secondary, and tertiary schemas using deterministic rules
 */
export function selectPrimarySecondarySchemas(
  normalizedItems: NormalizedItem[],
  instrumentPriority: Record<string, number> = {}
): SchemaSelectionResult {
  console.log(`[SCHEMA_SELECTION] Processing ${normalizedItems.length} normalized items`)

  // Step 1: Aggregate items by schema
  const schemaCandidates = aggregateBySchema(normalizedItems)
  
  if (schemaCandidates.length === 0) {
    return {
      confidence: 0,
      selection_notes: ['No valid schema candidates found'],
      tie_breakers_applied: []
    }
  }

  console.log(`[SCHEMA_SELECTION] Generated ${schemaCandidates.length} schema candidates`)
  
  // Step 2: Filter by primary threshold (from centralized config)
  const primaryCandidates = schemaCandidates.filter(
    candidate => candidate.tscore >= SCHEMA_SELECTION_THRESHOLDS.PRIMARY_MIN
  )

  console.log(`[SCHEMA_SELECTION] ${primaryCandidates.length} candidates meet primary threshold (≥T${SCHEMA_SELECTION_THRESHOLDS.PRIMARY_MIN})`)

  // Step 3: Check if we have any valid primary candidates
  if (primaryCandidates.length === 0) {
    return {
      confidence: 0,
      selection_notes: [
        `No primary schema found: highest score was T${Math.max(...schemaCandidates.map(c => c.tscore))} (< T${SCHEMA_SELECTION_THRESHOLDS.PRIMARY_MIN} threshold)`
      ],
      tie_breakers_applied: []
    }
  }

  // Step 4: Select primary schema (highest score with tie-breakers)
  const { winner: primary, tieBreakerNotes, tieBreakersApplied } = selectWinner(
    primaryCandidates, 
    instrumentPriority,
    'primary'
  )

  const selectionNotes: string[] = [
    `Primary schema: ${primary.clinical_id} (T${primary.tscore}) selected from ${primaryCandidates.length} candidates`
  ]
  selectionNotes.push(...tieBreakerNotes)

  // Step 5: Find secondary candidates
  const secondaryCandidates = schemaCandidates.filter(candidate => {
    // Must meet secondary threshold
    if (candidate.tscore < SCHEMA_SELECTION_THRESHOLDS.SECONDARY_MIN) {
      return false
    }
    
    // Cannot be the primary schema
    if (candidate.clinical_id === primary.clinical_id) {
      return false
    }
    
    // Must be within delta of primary
    const delta = primary.tscore - candidate.tscore
    return delta <= SCHEMA_SELECTION_THRESHOLDS.MAX_SECONDARY_DELTA
  })

  console.log(`[SCHEMA_SELECTION] ${secondaryCandidates.length} candidates eligible for secondary selection`)

  let secondary: SchemaCandidate | undefined
  let secondaryTieBreakers: TieBreakerRule[] = []

  if (secondaryCandidates.length > 0) {
    const secondaryResult = selectWinner(secondaryCandidates, instrumentPriority, 'secondary')
    secondary = secondaryResult.winner
    secondaryTieBreakers = secondaryResult.tieBreakersApplied
    
    selectionNotes.push(
      `Secondary schema: ${secondary.clinical_id} (T${secondary.tscore}) selected from ${secondaryCandidates.length} candidates`
    )
    selectionNotes.push(...secondaryResult.tieBreakerNotes)
  } else {
    const secondaryReasons = []
    const belowThreshold = schemaCandidates.filter(c => 
      c.clinical_id !== primary.clinical_id && 
      c.tscore < SCHEMA_SELECTION_THRESHOLDS.SECONDARY_MIN
    )
    const beyondDelta = schemaCandidates.filter(c => 
      c.clinical_id !== primary.clinical_id && 
      c.tscore >= SCHEMA_SELECTION_THRESHOLDS.SECONDARY_MIN &&
      (primary.tscore - c.tscore) > SCHEMA_SELECTION_THRESHOLDS.MAX_SECONDARY_DELTA
    )

    if (belowThreshold.length > 0) {
      secondaryReasons.push(`${belowThreshold.length} schemas below T${SCHEMA_SELECTION_THRESHOLDS.SECONDARY_MIN} threshold`)
    }
    if (beyondDelta.length > 0) {
      secondaryReasons.push(`${beyondDelta.length} schemas beyond Δ${SCHEMA_SELECTION_THRESHOLDS.MAX_SECONDARY_DELTA} from primary`)
    }

    selectionNotes.push(`No secondary schema: ${secondaryReasons.join(', ')}`)
  }

  // Step 6: Find tertiary candidates
  const tertiaryCandidates = schemaCandidates.filter(candidate => {
    // Must meet tertiary threshold
    if (candidate.tscore < SCHEMA_SELECTION_THRESHOLDS.TERTIARY_MIN) {
      return false
    }
    
    // Cannot be the primary or secondary schema
    if (candidate.clinical_id === primary.clinical_id) {
      return false
    }
    if (secondary && candidate.clinical_id === secondary.clinical_id) {
      return false
    }
    
    // Must be within delta of primary
    const delta = primary.tscore - candidate.tscore
    return delta <= SCHEMA_SELECTION_THRESHOLDS.MAX_TERTIARY_DELTA
  })

  console.log(`[SCHEMA_SELECTION] ${tertiaryCandidates.length} candidates eligible for tertiary selection`)

  let tertiary: SchemaCandidate | undefined
  let tertiaryTieBreakers: TieBreakerRule[] = []

  if (tertiaryCandidates.length > 0) {
    const tertiaryResult = selectWinner(tertiaryCandidates, instrumentPriority, 'tertiary')
    tertiary = tertiaryResult.winner
    tertiaryTieBreakers = tertiaryResult.tieBreakersApplied
    
    selectionNotes.push(
      `Tertiary schema: ${tertiary.clinical_id} (T${tertiary.tscore}) selected from ${tertiaryCandidates.length} candidates`
    )
    selectionNotes.push(...tertiaryResult.tieBreakerNotes)
  } else {
    const tertiaryReasons = []
    const belowThreshold = schemaCandidates.filter(c => 
      c.clinical_id !== primary.clinical_id && 
      (!secondary || c.clinical_id !== secondary.clinical_id) &&
      c.tscore < SCHEMA_SELECTION_THRESHOLDS.TERTIARY_MIN
    )
    const beyondDelta = schemaCandidates.filter(c => 
      c.clinical_id !== primary.clinical_id && 
      (!secondary || c.clinical_id !== secondary.clinical_id) &&
      c.tscore >= SCHEMA_SELECTION_THRESHOLDS.TERTIARY_MIN &&
      (primary.tscore - c.tscore) > SCHEMA_SELECTION_THRESHOLDS.MAX_TERTIARY_DELTA
    )

    if (belowThreshold.length > 0) {
      tertiaryReasons.push(`${belowThreshold.length} schemas below T${SCHEMA_SELECTION_THRESHOLDS.TERTIARY_MIN} threshold`)
    }
    if (beyondDelta.length > 0) {
      tertiaryReasons.push(`${beyondDelta.length} schemas beyond Δ${SCHEMA_SELECTION_THRESHOLDS.MAX_TERTIARY_DELTA} from primary`)
    }

    if (tertiaryReasons.length > 0) {
      selectionNotes.push(`No tertiary schema: ${tertiaryReasons.join(', ')}`)
    }
  }

  // Step 7: Calculate confidence
  const confidence = calculateConfidence(primary, secondary, primaryCandidates.length)

  return {
    primary: {
      clinical_id: primary.clinical_id,
      tscore: primary.tscore,
      reliability: primary.reliability,
      item_count: primary.item_count,
      instrument: primary.instrument
    },
    secondary: secondary ? {
      clinical_id: secondary.clinical_id,
      tscore: secondary.tscore,
      reliability: secondary.reliability,
      item_count: secondary.item_count,
      instrument: secondary.instrument
    } : undefined,
    tertiary: tertiary ? {
      clinical_id: tertiary.clinical_id,
      tscore: tertiary.tscore,
      reliability: tertiary.reliability,
      item_count: tertiary.item_count,
      instrument: tertiary.instrument
    } : undefined,
    confidence,
    selection_notes: selectionNotes,
    tie_breakers_applied: [...tieBreakersApplied, ...secondaryTieBreakers, ...tertiaryTieBreakers]
  }
}

/**
 * Aggregate normalized items by schema ID
 */
function aggregateBySchema(items: NormalizedItem[]): SchemaCandidate[] {
  const schemaGroups = new Map<CanonicalId, NormalizedItem[]>()

  // Group items by schema
  for (const item of items) {
    const schemaId = item.schema_id as CanonicalId
    if (!schemaGroups.has(schemaId)) {
      schemaGroups.set(schemaId, [])
    }
    schemaGroups.get(schemaId)!.push(item)
  }

  // Calculate aggregated scores for each schema
  const candidates: SchemaCandidate[] = []

  for (const [schemaId, schemaItems] of schemaGroups) {
    // Apply weights before aggregation
    let weightedSum = 0
    let totalWeight = 0

    for (const item of schemaItems) {
      weightedSum += item.tscore * item.weight
      totalWeight += item.weight
    }

    if (totalWeight === 0) continue

    const aggregatedTscore = Math.round(weightedSum / totalWeight)
    
    // Calculate reliability (simple item count-based for now)
    const reliability = Math.min(schemaItems.length / 3, 1.0) // Max reliability at 3+ items

    // Get primary instrument (most frequent)
    const instrumentCounts = new Map<string, number>()
    for (const item of schemaItems) {
      instrumentCounts.set(item.instrument, (instrumentCounts.get(item.instrument) || 0) + 1)
    }
    const primaryInstrument = Array.from(instrumentCounts.entries())
      .sort(([,a], [,b]) => b - a)[0][0]

    candidates.push({
      clinical_id: schemaId,
      tscore: aggregatedTscore,
      reliability,
      item_count: schemaItems.length,
      instrument: primaryInstrument,
      items: schemaItems
    })

    console.log(`[SCHEMA_SELECTION] ${schemaId}: T${aggregatedTscore} (${schemaItems.length} items, reliability: ${reliability.toFixed(2)})`)
  }

  return candidates.sort((a, b) => b.tscore - a.tscore)
}

/**
 * Select winner from candidates using tie-breaker rules
 */
function selectWinner(
  candidates: SchemaCandidate[], 
  instrumentPriority: Record<string, number>,
  selectionType: 'primary' | 'secondary' | 'tertiary'
): {
  winner: SchemaCandidate
  tieBreakerNotes: string[]
  tieBreakersApplied: TieBreakerRule[]
} {
  if (candidates.length === 1) {
    return {
      winner: candidates[0],
      tieBreakerNotes: [`Single ${selectionType} candidate, no tie-breakers needed`],
      tieBreakersApplied: []
    }
  }

  let remaining = [...candidates]
  const tieBreakerNotes: string[] = []
  const tieBreakersApplied: TieBreakerRule[] = []

  for (const rule of TIE_BREAKER_ORDER) {
    if (remaining.length === 1) break

    const beforeCount = remaining.length
    remaining = applyTieBreakerRule(remaining, rule, instrumentPriority)
    
    if (remaining.length < beforeCount) {
      tieBreakersApplied.push(rule)
      tieBreakerNotes.push(
        `Applied ${rule}: ${beforeCount} → ${remaining.length} candidates`
      )
    }
  }

  return {
    winner: remaining[0],
    tieBreakerNotes,
    tieBreakersApplied
  }
}

/**
 * Apply a specific tie-breaker rule
 */
function applyTieBreakerRule(
  candidates: SchemaCandidate[], 
  rule: TieBreakerRule,
  instrumentPriority: Record<string, number>
): SchemaCandidate[] {
  switch (rule) {
    case 'higher_tscore':
      const maxTscore = Math.max(...candidates.map(c => c.tscore))
      return candidates.filter(c => Math.abs(c.tscore - maxTscore) < 0.5) // Tie within 0.5 T-score

    case 'higher_reliability':
      const maxReliability = Math.max(...candidates.map(c => c.reliability))
      return candidates.filter(c => c.reliability === maxReliability)

    case 'higher_item_count':
      const maxItemCount = Math.max(...candidates.map(c => c.item_count))
      return candidates.filter(c => c.item_count === maxItemCount)

    case 'instrument_priority':
      const maxPriority = Math.max(...candidates.map(c => instrumentPriority[c.instrument] || 0))
      return candidates.filter(c => (instrumentPriority[c.instrument] || 0) === maxPriority)

    case 'lexicographic_canonical_id':
      const sortedIds = candidates.map(c => c.clinical_id).sort()
      return candidates.filter(c => c.clinical_id === sortedIds[0])

    default:
      return candidates
  }
}

/**
 * Calculate confidence score based on selection results
 */
function calculateConfidence(
  primary: SchemaCandidate,
  secondary: SchemaCandidate | undefined,
  totalCandidates: number
): number {
  let confidence = 0

  // Base confidence from T-score level
  if (primary.tscore >= 70) confidence += 0.5
  else if (primary.tscore >= 65) confidence += 0.4
  else if (primary.tscore >= thresholds.active) confidence += 0.3

  // Boost for clear separation from secondary
  if (secondary) {
    const separation = primary.tscore - secondary.tscore
    if (separation >= 5) confidence += 0.2
    else if (separation >= 3) confidence += 0.1
  } else {
    confidence += 0.2 // Boost for no competing secondary
  }

  // Boost for reliability
  if (primary.reliability >= 0.8) confidence += 0.2
  else if (primary.reliability >= 0.6) confidence += 0.1

  // Boost for item count
  if (primary.item_count >= 5) confidence += 0.1

  return Math.min(confidence, 1.0)
}
