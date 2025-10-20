
// Mapper functions to convert canonical JSON into accordion items

import React from "react"
import { CoacheeCanonicalProfile, LeadershipData, ClinicalData, PersonaSide, LEADERSHIP_KEY_ORDER, CLINICAL_KEY_ORDER } from "@/lib/types/canonical-json"
import { ViewMode, isVisibleInViewMode } from "@/lib/displayPolicy"
import { activationTier } from "@/lib/activation"

export interface AccordionItem {
  key: string
  title: string
  content: React.ReactNode
}

/**
 * Renders a value from the JSON data into appropriate React components
 */
export function renderValue(value: any): React.ReactNode {
  if (value == null || value === undefined || value === "") {
    return <em className="text-gray-500">—</em>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <em className="text-gray-500">—</em>
    }
    return (
      <ul className="list-disc pl-5 space-y-1">
        {value.map((item, index) => (
          <li key={index} className="text-gray-700">
            {String(item)}
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === "object") {
    const entries = Object.entries(value)
    if (entries.length === 0) {
      return <em className="text-gray-500">—</em>
    }
    return (
      <ul className="list-disc pl-5 space-y-1">
        {entries.map(([key, val]) => (
          <li key={key} className="text-gray-700">
            <strong className="font-medium">{key.replace(/_/g, ' ')}:</strong> {String(val)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
      {String(value)}
    </p>
  )
}

/**
 * Converts a key to a human-readable title
 */
export function keyToTitle(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Maps leadership section data to accordion items with threshold filtering
 */
export function mapLeadershipToItems(
  leadershipData: LeadershipData | undefined, 
  personaSide: PersonaSide,
  viewMode?: ViewMode,
  schemaRankings?: Array<{ schemaId: string; tscore: number; is_primary: boolean; is_secondary: boolean; is_tertiary: boolean }>
): AccordionItem[] {
  if (!leadershipData) {
    return LEADERSHIP_KEY_ORDER.map(key => ({
      key,
      title: keyToTitle(key),
      content: <em className="text-gray-500">No data available</em>
    }))
  }

  // If we have schema rankings and view mode, check if the primary/secondary/tertiary schemas meet thresholds
  if (viewMode && schemaRankings) {
    const relevantSchemas = personaSide === 'primary' 
      ? schemaRankings.filter(s => s.is_primary)
      : personaSide === 'secondary'
      ? schemaRankings.filter(s => s.is_secondary)
      : schemaRankings.filter(s => s.is_tertiary)
    
    // Only gate if *something* is actually flagged for this persona side
    if (relevantSchemas.length > 0) {
      // Check if any relevant schemas are visible in this view mode
      const hasVisibleSchemas = relevantSchemas.some(schema => {
        const tier = activationTier(schema.tscore)
        return isVisibleInViewMode(tier, viewMode)
      })

      if (!hasVisibleSchemas) {
        return [{
          key: 'threshold_message',
          title: 'Leadership Analysis',
          content: (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">
                {personaSide === 'primary' ? 'Primary' : personaSide === 'secondary' ? 'Secondary' : 'Tertiary'} schema patterns do not meet the current threshold criteria.
              </p>
              <p className="text-sm">
                Switch to "Exploratory" view to see emerging patterns (T50–59), or check other tabs.
              </p>
            </div>
          )
        }]
      }
    }
  }

  return LEADERSHIP_KEY_ORDER.map(key => ({
    key,
    title: keyToTitle(key),
    content: renderValue(leadershipData[key])
  }))
}

/**
 * Maps clinical section data to accordion items with threshold filtering
 */
export function mapClinicalToItems(
  clinicalData: ClinicalData | undefined, 
  personaSide: PersonaSide,
  viewMode?: ViewMode,
  schemaRankings?: Array<{ schemaId: string; tscore: number; is_primary: boolean; is_secondary: boolean; is_tertiary: boolean }>
): AccordionItem[] {
  if (!clinicalData) {
    return CLINICAL_KEY_ORDER.map(key => ({
      key,
      title: keyToTitle(key),
      content: <em className="text-gray-500">No data available</em>
    }))
  }

  // If we have schema rankings and view mode, check if the primary/secondary/tertiary schemas meet thresholds
  if (viewMode && schemaRankings) {
    const relevantSchemas = personaSide === 'primary' 
      ? schemaRankings.filter(s => s.is_primary)
      : personaSide === 'secondary'
      ? schemaRankings.filter(s => s.is_secondary)
      : schemaRankings.filter(s => s.is_tertiary)
    
    // Only gate if *something* is actually flagged for this persona side
    if (relevantSchemas.length > 0) {
      // Check if any relevant schemas are visible in this view mode
      const hasVisibleSchemas = relevantSchemas.some(schema => {
        const tier = activationTier(schema.tscore)
        return isVisibleInViewMode(tier, viewMode)
      })

      if (!hasVisibleSchemas) {
        return [{
          key: 'threshold_message',
          title: 'Clinical Analysis',
          content: (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">
                {personaSide === 'primary' ? 'Primary' : personaSide === 'secondary' ? 'Secondary' : 'Tertiary'} schema patterns do not meet the current threshold criteria.
              </p>
              <p className="text-sm">
                Switch to "Exploratory" view to see emerging patterns (T50–59), or check other tabs.
              </p>
            </div>
          )
        }]
      }
    }
  }

  return CLINICAL_KEY_ORDER.map(key => ({
    key,
    title: keyToTitle(key),
    content: renderValue(clinicalData[key])
  }))
}

/**
 * Maps coaching process section to accordion items
 */
export function mapCoachingToItems(
  coacheeProfile: CoacheeCanonicalProfile | null,
  section: "coaching_plan" | "session_log" | "additional_insights"
): AccordionItem[] {
  const data = coacheeProfile?.coaching_process?.[section]
  
  return [{
    key: section,
    title: keyToTitle(section),
    content: renderValue(data)
  }]
}

/**
 * Maps advanced insights section to accordion items
 */
export function mapAdvancedInsightsToItems(
  coacheeProfile: CoacheeCanonicalProfile | null
): AccordionItem[] {
  const insights = coacheeProfile?.advanced_insights

  return [{
    key: "advanced_insights",
    title: "Advanced Insights",
    content: insights ? (
      <div className="space-y-4">
        {insights.hypotheses && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Hypotheses</h4>
            {renderValue(insights.hypotheses)}
          </div>
        )}
        {insights.correlations && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Correlations</h4>
            {renderValue(insights.correlations)}
          </div>
        )}
        {insights.intervention_targets && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Intervention Targets</h4>
            {renderValue(insights.intervention_targets)}
          </div>
        )}
      </div>
    ) : <em className="text-gray-500">No advanced insights available</em>
  }]
}
