
'use client'

import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface ModeExplanationCardProps {
  mode: {
    mode: string
    p: number
    contrib: Array<{ clinical_id: string; score: number }>
    copingLift: { S: number; A: number; O: number }
    gateLift: number
  }
  rank: number
  compact?: boolean
}

export default function ModeExplanationCard({ mode, rank, compact }: ModeExplanationCardProps) {
  const { contrib, copingLift, gateLift } = mode

  // Get top contributors
  const topContributors = contrib.slice(0, compact ? 3 : 5)

  // Get significant coping lifts
  const copingContributions = [
    { label: 'Surrender', value: copingLift.S, key: 'S' },
    { label: 'Avoidance', value: copingLift.A, key: 'A' },
    { label: 'Overcompensation', value: copingLift.O, key: 'O' }
  ].filter(c => Math.abs(c.value) > 0.01)

  return (
    <div className="space-y-3">
      {/* Schema Contributions */}
      {topContributors.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Top Schema Contributions
          </h5>
          <div className="space-y-1.5">
            {topContributors.map(({ clinical_id, score }) => (
              <div key={clinical_id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {clinical_id.replace(/_/g, ' ')}
                  </p>
                </div>
                <Badge
                  variant={score > 0 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {score > 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(score).toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coping Contributions */}
      {!compact && copingContributions.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Coping Style Influences
          </h5>
          <div className="flex flex-wrap gap-2">
            {copingContributions.map(({ label, value, key }) => (
              <Badge
                key={key}
                variant="outline"
                className="text-xs"
              >
                {label}: {value > 0 ? '+' : ''}{value.toFixed(3)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Context Gate Lift */}
      {!compact && Math.abs(gateLift) > 0.01 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Context Influence
          </h5>
          <Badge
            variant={gateLift > 0 ? 'default' : 'secondary'}
            className="text-xs"
          >
            {gateLift > 0 ? 'Activated' : 'Suppressed'}: {Math.abs(gateLift).toFixed(3)}
          </Badge>
        </div>
      )}
    </div>
  )
}
