
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Link, CheckCircle, AlertCircle, Users, Zap, Shield, BarChart3 } from "lucide-react"

interface BridgeResult {
  success: boolean
  bridged: number
  failed: number
  messages: string[]
  bridge_version?: string
  processing_notes?: string[]
}

export function AssessmentBridge() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<BridgeResult | null>(null)
  const [profileIds, setProfileIds] = useState<string[]>([])

  const handleBridge = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      const response = await fetch('/api/bridge-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'bridge-all-qa' })
      })

      const data = await response.json()
      setResult(data)

      // Refresh profile list
      await loadProfiles()
      
    } catch (error) {
      console.error('Error bridging assessments:', error)
      setResult({
        success: false,
        bridged: 0,
        failed: 1,
        messages: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/bridge-assessments?action=list-profiles')
      const data = await response.json()
      setProfileIds(data.profileIds || [])
    } catch (error) {
      console.error('Error loading profiles:', error)
    }
  }

  React.useEffect(() => {
    loadProfiles()
  }, [])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Assessment Bridge
        </CardTitle>
        <CardDescription>
          Connect your uploaded assessments to the Coaching Hub for dynamic analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Active Coachee Profiles:</span>
          </div>
          <Badge variant="secondary">
            {profileIds.length} profiles
          </Badge>
        </div>

        {/* Bridge V2 Action */}
        <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900 text-lg">Bridge V2 Assessment Processing</span>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Advanced processing with comprehensive schema rankings, T-score analysis, and full visualization support. 
            Enables all features including the Schema Rankings tab in Coaching Hub.
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-4 bg-blue-100 p-3 rounded">
            <BarChart3 className="h-4 w-4" />
            <span><strong>Features:</strong> Schema Rankings • T-Score Analysis • Professional Reporting • Modern LASBI Support</span>
          </div>
          <Button 
            onClick={handleBridge} 
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing All Assessments...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Bridge All Assessments
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Bridging {result.success ? 'Completed' : 'Failed'}
                    {result.bridge_version && (
                      <span className="ml-2 text-xs bg-white px-2 py-1 rounded">
                        {result.bridge_version}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    ✓ {result.bridged} bridged • ✗ {result.failed} failed
                  </div>
                </div>
              </div>

              {result.success && result.bridged > 0 && (
                <div className="bg-blue-100 text-blue-800 p-2 rounded text-xs">
                  <BarChart3 className="h-3 w-3 inline mr-1" />
                  All features including Schema Rankings visualization are now available for bridged clients in the Coaching Hub!
                </div>
              )}
            </div>

            {/* Messages */}
            {result.messages.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Details:</div>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 max-h-40 overflow-y-auto">
                  {result.messages.map((message, index) => (
                    <div key={index} className={`text-xs ${
                      message.startsWith('✓') ? 'text-green-700' : 
                      message.startsWith('✗') ? 'text-red-700' : 'text-gray-600'
                    }`}>
                      {message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Notes for QA Bridge */}
            {result.processing_notes && result.processing_notes.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Technical Details:</div>
                <div className="bg-blue-50 p-3 rounded-lg space-y-1 max-h-32 overflow-y-auto">
                  {result.processing_notes.map((note, index) => (
                    <div key={index} className="text-xs text-blue-700">
                      • {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>How it works:</strong> After uploading assessment files, use this tool to bridge them to the Coaching Hub using Bridge V2 processing. 
          This provides comprehensive schema analysis, T-score calculations, and enables all visualization features including Schema Rankings. 
          Bridged clients appear in the Coaching Hub with their complete assessment analysis.
        </div>
      </CardContent>
    </Card>
  )
}
