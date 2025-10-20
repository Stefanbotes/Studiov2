
// Display policy system that determines what content to show for each activation tier
// This centralizes the UI logic that was scattered across components

import { ActivationTier } from "./activation"

export type DisplayPolicy = {
  showLeadership: boolean
  showClinical: boolean
  detailLevel: "full" | "brief" | "none"
  disclaimer?: "subthreshold"
  showInSecondary?: boolean
}

export type ViewMode = "strict" | "exploratory"

/**
 * Returns the display policy for a given activation tier
 * @param tier - The activation tier
 * @returns Display policy object
 */
export function policyFor(tier: ActivationTier): DisplayPolicy {
  switch (tier) {
    case "active":
      return { 
        showLeadership: true, 
        showClinical: true, 
        detailLevel: "full",
        showInSecondary: true
      }
    case "emerging":
      return { 
        showLeadership: true, 
        showClinical: true, 
        detailLevel: "brief", 
        disclaimer: "subthreshold",
        showInSecondary: true
      }
    default:
      return { 
        showLeadership: false, 
        showClinical: false, 
        detailLevel: "none",
        showInSecondary: false
      }
  }
}

/**
 * Checks if content should be visible based on view mode and activation tier
 * @param tier - The activation tier
 * @param viewMode - Current view mode (strict vs exploratory)
 * @returns True if content should be visible
 */
export function isVisibleInViewMode(tier: ActivationTier, viewMode: ViewMode): boolean {
  if (tier === "active") return true
  if (tier === "emerging") return viewMode === "exploratory"
  return false // "suppressed" is never visible in main content
}

/**
 * Gets appropriate CSS classes for styling based on tier and significance
 * @param tier - The activation tier
 * @param isSecondary - Whether this is in a secondary display context
 * @returns CSS class string
 */
export function getTierStyling(tier: ActivationTier, isSecondary: boolean = false): string {
  const baseClasses = "rounded-xl border p-4"
  
  switch (tier) {
    case "active":
      return `${baseClasses} border-red-200 bg-red-50`
    case "emerging":
      return `${baseClasses} border-amber-200 bg-amber-50 ${isSecondary ? 'opacity-90' : ''}`
    default:
      return `${baseClasses} border-gray-200 bg-gray-50 opacity-60`
  }
}
