
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ModeExplanationCard from './mode-explanation-card'
import { TrendingUp, AlertCircle } from 'lucide-react'

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

interface ModeResultsDisplayProps {
  result: ModeScore
}

export default function ModeResultsDisplay({ result }: ModeResultsDisplayProps) {
  const { modes, entropy, top2Gap } = result

  // Get top 5 modes
  const topModes = modes.slice(0, 5)

  // Determine confidence level
  const getConfidenceLevel = () => {
    if (top2Gap > 0.3) return { label: 'High', color: 'bg-green-500' }
    if (top2Gap > 0.15) return { label: 'Moderate', color: 'bg-yellow-500' }
    return { label: 'Low', color: 'bg-red-500' }
  }

  const confidence = getConfidenceLevel()

  return (
    <div className="space-y-4">
      {/* Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Analysis Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Prediction Confidence</p>
              <div className="flex items-center gap-2">
                <Badge className={`${confidence.color} text-white`}>
                  {confidence.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  Gap: {(top2Gap * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Entropy</p>
              <p className="text-lg font-semibold">{entropy.toFixed(3)} nats</p>
              <p className="text-xs text-gray-500">
                {entropy < 0.5 ? 'Very certain' : entropy < 1.0 ? 'Moderate uncertainty' : 'High uncertainty'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Mode */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-2 bg-purple-600">Primary Mode</Badge>
              <CardTitle className="text-xl">
                {topModes[0].mode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600">
                {(topModes[0].p * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">Probability</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ModeExplanationCard mode={topModes[0]} rank={1} />
        </CardContent>
      </Card>

      {/* Other Top Modes */}
      <div className="space-y-3">
        {topModes.slice(1).map((mode, idx) => (
          <Card key={mode.mode}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">#{idx + 2}</Badge>
                    <h4 className="font-semibold">
                      {mode.mode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                  </div>
                  <Progress value={mode.p * 100} className="h-2" />
                </div>
                <div className="ml-4 text-right">
                  <p className="text-xl font-bold text-gray-700">
                    {(mode.p * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ModeExplanationCard mode={mode} rank={idx + 2} compact />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low confidence warning */}
      {confidence.label === 'Low' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Low Confidence</p>
                <p className="text-sm text-yellow-800 mt-1">
                  The model shows low confidence in the primary mode prediction. Consider reviewing
                  the input data or gathering more information for a clearer assessment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
