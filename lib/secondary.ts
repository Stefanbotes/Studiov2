
// Secondary tab content builder with fallback logic
// Ensures Secondary tab always has meaningful content

import { thresholds } from "@/config/thresholds"
import { activationTier, ActivationTier } from "./activation"

export interface SchemaItem {
  id: string
  name?: string
  tscore: number
  percentile?: number
  [key: string]: any
}

/**
 * Builds secondary tab content with intelligent fallback
 * Always returns the top N schemas, preferring those that meet thresholds
 * @param schemas - Array of schema objects with T-scores
 * @returns Array of top schemas for secondary display
 */
export function buildSecondary<T extends SchemaItem>(schemas: T[]): T[] {
  if (!schemas?.length) return []
  
  // Sort by T-score descending
  const sorted = [...schemas].sort((a, b) => b.tscore - a.tscore)
  
  // Get schemas that are eligible (not suppressed)
  const eligible = sorted.filter(s => {
    const tier = activationTier(s.tscore)
    return tier !== "suppressed"
  })
  
  // Use eligible schemas if we have enough, otherwise fall back to top N overall
  const selected = eligible.length >= thresholds.secondaryCount 
    ? eligible.slice(0, thresholds.secondaryCount)
    : sorted.slice(0, thresholds.secondaryCount)
  
  return selected
}

/**
 * Categorizes schemas by activation tier for analysis
 * @param schemas - Array of schema objects with T-scores
 * @returns Object with schemas grouped by tier
 */
export function categorizeByTier<T extends SchemaItem>(schemas: T[]): {
  active: T[]
  emerging: T[]
  suppressed: T[]
} {
  const result = {
    active: [] as T[],
    emerging: [] as T[],
    suppressed: [] as T[]
  }
  
  schemas.forEach(schema => {
    const tier = activationTier(schema.tscore)
    result[tier].push(schema)
  })
  
  // Sort each tier by T-score descending
  Object.values(result).forEach(tierArray => {
    tierArray.sort((a, b) => b.tscore - a.tscore)
  })
  
  return result
}

/**
 * Gets summary statistics for secondary tab display
 * @param schemas - Array of schema objects with T-scores
 * @returns Summary statistics object
 */
export function getSecondaryStats<T extends SchemaItem>(schemas: T[]): {
  totalSchemas: number
  activeCount: number
  emergingCount: number
  suppressedCount: number
  highestScore: number
  lowestScore: number
  averageScore: number
} {
  if (!schemas?.length) {
    return {
      totalSchemas: 0,
      activeCount: 0,
      emergingCount: 0,
      suppressedCount: 0,
      highestScore: 0,
      lowestScore: 0,
      averageScore: 0
    }
  }
  
  const categorized = categorizeByTier(schemas)
  const scores = schemas.map(s => s.tscore)
  
  return {
    totalSchemas: schemas.length,
    activeCount: categorized.active.length,
    emergingCount: categorized.emerging.length,
    suppressedCount: categorized.suppressed.length,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }
}
