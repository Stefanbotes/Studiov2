
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SchemaInputFormProps {
  scores: Record<string, number>
  onChange: (scores: Record<string, number>) => void
  availableSchemas: string[]
}

export default function SchemaInputForm({
  scores,
  onChange,
  availableSchemas
}: SchemaInputFormProps) {
  const [selectedSchema, setSelectedSchema] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')

  const handleAdd = () => {
    if (selectedSchema && inputValue) {
      const value = parseFloat(inputValue)
      if (!isNaN(value) && value >= -3 && value <= 3) {
        onChange({ ...scores, [selectedSchema]: value })
        setSelectedSchema('')
        setInputValue('')
      }
    }
  }

  const handleRemove = (schema: string) => {
    const newScores = { ...scores }
    delete newScores[schema]
    onChange(newScores)
  }

  const handleUpdate = (schema: string, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= -3 && numValue <= 3) {
      onChange({ ...scores, [schema]: numValue })
    }
  }

  const handleQuickAdd = (schema: string, value: number) => {
    onChange({ ...scores, [schema]: value })
  }

  const availableToAdd = availableSchemas.filter(s => !scores[s])

  return (
    <div className="space-y-4">
      {/* Current Scores */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {Object.entries(scores).map(([schema, value]) => (
          <div key={schema} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {schema.replace(/_/g, ' ')}
              </p>
            </div>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleUpdate(schema, e.target.value)}
              min="-3"
              max="3"
              step="0.1"
              className="w-20 h-8"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(schema)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {Object.keys(scores).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No schemas added yet
          </p>
        )}
      </div>

      {/* Add New Schema */}
      <div className="space-y-2 pt-4 border-t">
        <Label className="text-xs font-medium text-gray-600">Add Schema</Label>
        <div className="flex gap-2">
          <Select value={selectedSchema} onValueChange={setSelectedSchema}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select schema..." />
            </SelectTrigger>
            <SelectContent>
              {availableToAdd.length > 0 ? (
                availableToAdd.map((schema) => (
                  <SelectItem key={schema} value={schema}>
                    {schema.replace(/_/g, ' ')}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  All schemas added
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Z-score"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            min="-3"
            max="3"
            step="0.1"
            className="w-24"
          />
          <Button
            onClick={handleAdd}
            disabled={!selectedSchema || !inputValue}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Add Buttons */}
        {selectedSchema && (
          <div className="flex gap-1 pt-2">
            <span className="text-xs text-gray-500 mr-2">Quick add:</span>
            {[-2, -1, 0, 1, 2].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => {
                  handleQuickAdd(selectedSchema, val)
                  setSelectedSchema('')
                }}
                className="h-7 px-2 text-xs"
              >
                {val > 0 ? `+${val}` : val}
              </Button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Z-scores typically range from -3 to +3 (standard deviations from mean)
      </p>
    </div>
  )
}
