
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, Zap } from 'lucide-react'

interface CopingBreakdownProps {
  coping: {
    cS: number
    cA: number
    cO: number
    raw: { S: number; A: number; O: number }
  }
}

export default function CopingBreakdown({ coping }: CopingBreakdownProps) {
  const { cS, cA, cO, raw } = coping

  const copingStyles = [
    {
      key: 'S',
      label: 'Surrender',
      probability: cS,
      raw: raw.S,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Giving in to schemas, accepting negative patterns'
    },
    {
      key: 'A',
      label: 'Avoidance',
      probability: cA,
      raw: raw.A,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Avoiding situations that trigger schemas'
    },
    {
      key: 'O',
      label: 'Overcompensation',
      probability: cO,
      raw: raw.O,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Fighting against schemas, doing the opposite'
    }
  ]

  // Sort by probability
  const sortedStyles = [...copingStyles].sort((a, b) => b.probability - a.probability)
  const dominant = sortedStyles[0]

  return (
    <div className="space-y-4">
      {/* Dominant Coping Style */}
      <Card className={`${dominant.borderColor} ${dominant.bgColor}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-2">Dominant Coping Style</Badge>
              <CardTitle className="text-xl flex items-center gap-2">
                {<dominant.icon className={`h-6 w-6 ${dominant.color}`} />}
                {dominant.label}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">{dominant.description}</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${dominant.color}`}>
                {(dominant.probability * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">Probability</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* All Coping Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coping Style Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedStyles.map((style) => {
            const Icon = style.icon
            return (
              <div key={style.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${style.color}`} />
                    <div>
                      <p className="font-medium">{style.label}</p>
                      <p className="text-xs text-gray-500">{style.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${style.color}`}>
                      {(style.probability * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Raw: {style.raw.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={style.probability * 100} 
                  className="h-3"
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Raw Scores Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Raw Aggregated Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {copingStyles.map((style) => (
              <div key={style.key} className="text-center">
                <p className="text-sm text-gray-600 mb-1">{style.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {style.raw.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Raw scores represent weighted sums of schema activations before softmax normalization.
          </p>
        </CardContent>
      </Card>

      {/* Interpretation Guide */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-900 mb-2">Interpretation Guide</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-medium">•</span>
              <span>
                <strong>Surrender:</strong> May indicate acceptance of negative patterns, compliance, or giving up
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">•</span>
              <span>
                <strong>Avoidance:</strong> May indicate withdrawal, escape behaviors, or emotional distancing
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">•</span>
              <span>
                <strong>Overcompensation:</strong> May indicate counter-dependent behaviors or excessive control
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
