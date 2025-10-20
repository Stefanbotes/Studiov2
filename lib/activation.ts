
// Centralized classification system for schema activation tiers
// This replaces scattered threshold logic throughout the app

import { thresholds } from "@/config/thresholds"

export type ActivationTier = "active" | "emerging" | "suppressed"

/**
 * Classifies a T-score into an activation tier for consistent UI gating
 * @param tScore - The T-score to classify
 * @returns The activation tier
 */
export function activationTier(tScore: number): ActivationTier {
  if (tScore >= thresholds.active) return "active"
  if (tScore >= thresholds.subthresholdMin) return "emerging"
  return "suppressed"
}

/**
 * Gets clinical significance level based on T-score
 * @param tScore - The T-score to evaluate
 * @returns Clinical significance level
 */
export function getClinicalSignificance(tScore: number): 'very_high' | 'high' | 'moderate' | 'low' | 'very_low' {
  if (tScore >= thresholds.clinical.veryHigh) return 'very_high'
  if (tScore >= thresholds.clinical.high) return 'high'
  if (tScore >= thresholds.clinical.moderate) return 'moderate'
  if (tScore >= thresholds.clinical.low) return 'low'
  return 'very_low'
}

/**
 * Gets tier range label for display purposes
 * @param tScore - The T-score to evaluate
 * @returns Tier range string
 */
export function getTierRange(tScore: number): string {
  if (tScore >= thresholds.tierRanges.clinical) return 'Clinical Range'
  if (tScore >= thresholds.tierRanges.atRisk) return 'At-Risk Range'
  if (tScore >= thresholds.tierRanges.moderate) return 'Moderate Range'
  return 'Low Range'
}

/**
 * Checks if a T-score meets the threshold for a given tier
 * @param tScore - The T-score to check
 * @param tier - The tier to check against
 * @returns True if the score meets the threshold
 */
export function meetsTierThreshold(tScore: number, tier: ActivationTier): boolean {
  switch (tier) {
    case 'active':
      return tScore >= thresholds.active
    case 'emerging':
      return tScore >= thresholds.subthresholdMin && tScore < thresholds.active
    case 'suppressed':
      return tScore < thresholds.subthresholdMin
    default:
      return false
  }
}
