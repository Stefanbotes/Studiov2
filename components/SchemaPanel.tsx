
"use client"

import React from "react"
import { activationTier } from "@/lib/activation"
import { policyFor, isVisibleInViewMode, getTierStyling, ViewMode } from "@/lib/displayPolicy"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface SchemaPanelProps {
  schemaName: string
  schemaId: string
  tscore: number
  percentile?: number
  viewMode: ViewMode
  children?: React.ReactNode
  className?: string
  showDisclaimer?: boolean
  isSecondary?: boolean
}

export function SchemaPanel({ 
  schemaName, 
  schemaId,
  tscore, 
  percentile,
  viewMode, 
  children,
  className = "",
  showDisclaimer = true,
  isSecondary = false
}: SchemaPanelProps) {
  const tier = activationTier(tscore)
  const policy = policyFor(tier)

  // Hide content that doesn't meet view mode criteria
  const hiddenByViewMode = !isVisibleInViewMode(tier, viewMode)
  if (hiddenByViewMode || policy.detailLevel === "none") {
    return null
  }

  const styling = getTierStyling(tier, isSecondary)

  return (
    <div className={`${styling} ${className}`}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-900">{schemaName}</h3>
        <div className="flex items-center gap-2">
          {percentile && (
            <span className="text-xs text-gray-500">
              {percentile}%ile
            </span>
          )}
          <Badge 
            variant="outline" 
            className={tier === "active" 
              ? "bg-red-100 text-red-800 border-red-300" 
              : "bg-amber-100 text-amber-800 border-amber-300"
            }
          >
            T{tscore}
          </Badge>
        </div>
      </div>

      {/* Subthreshold disclaimer */}
      {policy.disclaimer === "subthreshold" && showDisclaimer && (
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            <strong>Subthreshold Pattern (T{tscore}):</strong> This pattern is in the emerging range (T{tscore}). 
            Use as exploratory coaching context. Most reliable clinical insights appear at T ≥ 60.
          </AlertDescription>
        </Alert>
      )}

      {/* Content based on detail level */}
      {policy.detailLevel === "full" && children && (
        <div className="space-y-3">
          {children}
        </div>
      )}

      {policy.detailLevel === "brief" && (
        <div className="space-y-3">
          <div className="text-sm text-gray-700 bg-white/60 rounded p-3">
            <p className="font-medium text-amber-700 mb-1">Emerging Pattern Context</p>
            <p>
              This schema shows moderate activation (T{tscore}). Consider as background context 
              for coaching conversations while focusing on higher-scoring primary patterns.
            </p>
          </div>
          {/* Brief version of children content could be rendered here */}
          {children && (
            <div className="text-sm opacity-90">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SchemaPanel
