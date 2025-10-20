
'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface ContextGatesPanelProps {
  gates: Record<string, number>
  onChange: (gates: Record<string, number>) => void
}

const gateDescriptions: Record<string, { label: string; description: string }> = {
  intimacy: {
    label: 'Intimacy',
    description: 'Closeness in relationships'
  },
  evaluation: {
    label: 'Evaluation',
    description: 'Performance scrutiny'
  },
  limits: {
    label: 'Limits',
    description: 'Boundary setting'
  },
  competition: {
    label: 'Competition',
    description: 'Competitive situations'
  },
  rule: {
    label: 'Rule',
    description: 'Rule enforcement'
  }
}

export default function ContextGatesPanel({ gates, onChange }: ContextGatesPanelProps) {
  const handleChange = (gate: string, value: number[]) => {
    onChange({ ...gates, [gate]: value[0] })
  }

  return (
    <div className="space-y-6">
      {Object.entries(gateDescriptions).map(([key, { label, description }]) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-sm font-medium">{label}</Label>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <span className="text-sm font-semibold text-purple-600 min-w-[3rem] text-right">
              {gates[key]?.toFixed(2) || '0.50'}
            </span>
          </div>
          <Slider
            value={[gates[key] || 0.5]}
            onValueChange={(value) => handleChange(key, value)}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      ))}
    </div>
  )
}
