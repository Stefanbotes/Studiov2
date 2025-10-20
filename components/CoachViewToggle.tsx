
"use client"

import { ViewMode } from "@/lib/displayPolicy"
import { thresholds } from "@/config/thresholds"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

interface CoachViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
  className?: string
}

export function CoachViewToggle({ value, onChange, className = "" }: CoachViewToggleProps) {
  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <div>
              <Label htmlFor="view-mode-select" className="text-sm font-medium text-gray-700">
                Coach View Mode
              </Label>
              <p className="text-xs text-gray-600 mt-0.5">
                Control threshold-based content visibility
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger 
                id="view-mode-select"
                className="w-48 bg-white border-blue-200"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">
                  ≥T{thresholds.active} only (Strict)
                </SelectItem>
                <SelectItem value="exploratory">
                  Include T{thresholds.subthresholdMin}–{thresholds.active - 1} (Exploratory)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-600 bg-white/50 rounded p-2">
          <strong>Strict view:</strong> Shows only T ≥ {thresholds.active} (clinically reliable). 
          <br />
          <strong>Exploratory view:</strong> Includes T{thresholds.subthresholdMin}–{thresholds.active - 1} for emerging pattern coaching.
        </div>
      </CardContent>
    </Card>
  )
}

export default CoachViewToggle
