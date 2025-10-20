
"use client"

import { useState, useEffect, useMemo } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Brain, Loader2, AlertCircle } from "lucide-react"
import ContextGatesPanel from "@/components/mode-explorer/context-gates-panel"
import ModeResultsDisplay from "@/components/mode-explorer/mode-results-display"
import CopingBreakdown from "@/components/mode-explorer/coping-breakdown"
import { CoacheeCanonicalProfile, PersonaSide } from "@/lib/types/canonical-json"

interface ModeAnalysisTabProps {
  profile: CoacheeCanonicalProfile | null
  personaSide: PersonaSide
}

interface ModeScore {
  coping: {
    cS: number
    cA: number
    cO: number
    raw: { S: number; A: number; O: number }
  }
  modes: Array<{
    mode: string
    p: number
    contrib: Array<{ clinical_id: string; score: number }>
    copingLift: { S: number; A: number; O: number }
    gateLift: number
  }>
  tau: number
  entropy: number
  top2Gap: number
}

export default function ModeAnalysisTab({ profile, personaSide }: ModeAnalysisTabProps) {
  const [gates, setGates] = useState<Record<string, number>>({
    intimacy: 0.5,
    evaluation: 0.5,
    limits: 0.5,
    competition: 0.5,
    rule: 0.5
  })
  const [modeScores, setModeScores] = useState<ModeScore | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract schema z-scores from profile
  const schemaZScores = useMemo(() => {
    if (!profile?.analysis_lineage?.schema_rankings) {
      return null
    }

    // Convert T-scores to z-scores: z = (T - 50) / 10
    const zScores: Record<string, number> = {}
    
    profile.analysis_lineage.schema_rankings.forEach(schema => {
      zScores[schema.schemaId] = (schema.tscore - 50) / 10
    })

    return zScores
  }, [profile])

  // Calculate mode scores whenever gates change or profile changes
  useEffect(() => {
    if (schemaZScores) {
      calculateModeScores()
    }
  }, [schemaZScores, gates])

  const calculateModeScores = async () => {
    if (!schemaZScores) return

    setIsCalculating(true)
    setError(null)

    try {
      const response = await fetch('/api/mode-scorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          z: schemaZScores,
          gates
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to calculate mode scores')
      }

      const data = await response.json()
      setModeScores(data.result)
    } catch (err) {
      console.error('Error calculating mode scores:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsCalculating(false)
    }
  }

  // No profile loaded
  if (!profile) {
    return (
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Assessment Data Available
              </h3>
              <p className="text-sm text-gray-600">
                Mode analysis requires a bridged assessment with schema scores. 
                Please select a coachee with a JSON profile or bridge an assessment first.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No schema rankings in profile
  if (!schemaZScores) {
    return (
      <Card className="border-2 border-red-200">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Missing Schema Rankings
              </h3>
              <p className="text-sm text-gray-600">
                This profile doesn't contain schema rankings data (analysis_lineage).
                Mode analysis cannot be performed without standardized schema scores.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const schemaCount = Object.keys(schemaZScores).length
  const personaLabel = personaSide === 'primary' ? 'Primary' : personaSide === 'secondary' ? 'Secondary' : 'Tertiary'

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl">Mode Analysis</CardTitle>
              </div>
              <CardDescription className="text-base">
                Probabilistic mode activation analysis based on {profile.participant.name}'s assessment data
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-white text-purple-700 border-purple-300">
              {personaLabel} Persona
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-purple-200 bg-white/50">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-sm">
              <strong>Auto-populated from assessment:</strong> Schema scores extracted from {profile.participant.name}'s 
              bridged assessment data ({schemaCount} schemas). Adjust context gates below to explore how different 
              situations might influence mode activation patterns.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Context Gates Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Context Gates</CardTitle>
          <CardDescription>
            Adjust situational context factors to see how they influence mode activation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContextGatesPanel gates={gates} onChange={setGates} />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error calculating modes:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isCalculating && !modeScores && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="text-gray-600">Calculating mode probabilities...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode Results */}
      {modeScores && (
        <>
          <ModeResultsDisplay result={modeScores} />
          
          <CopingBreakdown coping={modeScores.coping} />
        </>
      )}

      {/* Methodology Note */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            About Mode Analysis
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            This analysis uses a probabilistic model to predict mode activation patterns based on schema scores 
            and contextual factors. The model considers base schema weights, coping style estimations (Surrender, 
            Avoidance, Overcompensation), and contextual gates (intimacy, evaluation, limits, competition, rule). 
            Results are provided as probabilities and should be interpreted as hypotheses for exploration in coaching sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
