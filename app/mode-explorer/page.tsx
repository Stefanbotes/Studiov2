
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Brain, TrendingUp, Info } from 'lucide-react'
import SchemaInputForm from '@/components/mode-explorer/schema-input-form'
import ContextGatesPanel from '@/components/mode-explorer/context-gates-panel'
import ModeResultsDisplay from '@/components/mode-explorer/mode-results-display'
import CopingBreakdown from '@/components/mode-explorer/coping-breakdown'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

interface SystemInfo {
  schemas: string[]
  modes: string[]
  gates: string[]
  schemaCount: number
  modeCount: number
}

export default function ModeExplorerPage() {
  const [schemaScores, setSchemaScores] = useState<Record<string, number>>({})
  const [gates, setGates] = useState<Record<string, number>>({
    intimacy: 0.5,
    evaluation: 0.5,
    limits: 0.5,
    competition: 0.5,
    rule: 0.5
  })
  const [result, setResult] = useState<ModeScore | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/mode-scorer')
      const data = await response.json()
      if (data.info) {
        setSystemInfo(data.info)
      }
    } catch (err) {
      console.error('Failed to fetch system info:', err)
    }
  }

  // Load system info on mount
  useEffect(() => {
    fetchSystemInfo()
  }, [])

  const handleCalculate = async () => {
    if (Object.keys(schemaScores).length === 0) {
      setError('Please enter at least one schema score')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/mode-scorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ z: schemaScores, gates })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to calculate mode scores')
      }

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSchemaScores({})
    setGates({
      intimacy: 0.5,
      evaluation: 0.5,
      limits: 0.5,
      competition: 0.5,
      rule: 0.5
    })
    setResult(null)
    setError(null)
  }

  const handleLoadExample = () => {
    // Example data: vulnerable child pattern
    setSchemaScores({
      abandonment_instability: 1.5,
      emotional_deprivation: 1.2,
      defectiveness_shame: 1.0,
      mistrust_abuse: 0.8,
      subjugation: 1.1
    })
    setGates({
      intimacy: 0.8,
      evaluation: 0.3,
      limits: 0.5,
      competition: 0.2,
      rule: 0.4
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mode Explorer</h1>
          </div>
          <p className="text-gray-600">
            Explore potential schema modes based on schema z-scores, coping styles, and contextual factors
          </p>
          {systemInfo && (
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>📊 {systemInfo.schemaCount} schemas</span>
              <span>🎭 {systemInfo.modeCount} modes</span>
              <span>🎚️ {systemInfo.gates.length} context gates</span>
            </div>
          )}
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            <strong>How it works:</strong> Enter standardized schema scores (z-scores), adjust context gates,
            and the probabilistic model will estimate mode activation probabilities along with coping style predictions.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schema Z-Scores</CardTitle>
                <CardDescription>
                  Enter standardized schema scores (-3 to +3)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SchemaInputForm
                  scores={schemaScores}
                  onChange={setSchemaScores}
                  availableSchemas={systemInfo?.schemas || []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Context Gates</CardTitle>
                <CardDescription>
                  Adjust contextual factors (0 = low, 1 = high)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContextGatesPanel
                  gates={gates}
                  onChange={setGates}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleCalculate}
                disabled={loading || Object.keys(schemaScores).length === 0}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Calculate Modes
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handleLoadExample}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Load Example
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
            {result ? (
              <Tabs defaultValue="modes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="modes">Mode Probabilities</TabsTrigger>
                  <TabsTrigger value="coping">Coping Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="modes" className="space-y-4">
                  <ModeResultsDisplay result={result} />
                </TabsContent>

                <TabsContent value="coping" className="space-y-4">
                  <CopingBreakdown coping={result.coping} />
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Results Yet</p>
                  <p className="text-sm mt-2">Enter schema scores and click "Calculate Modes" to see results</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
