

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Target, AlertTriangle, Info, Trophy, Star, Zap } from "lucide-react"
import { CoacheeCanonicalProfile } from "@/lib/types/canonical-json"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import toast from 'react-hot-toast'
import { thresholds } from "@/config/thresholds"
import { activationTier, getClinicalSignificance, getTierRange } from "@/lib/activation"
import { ViewMode, isVisibleInViewMode } from "@/lib/displayPolicy"
import { buildSecondary, getSecondaryStats } from "@/lib/secondary"
import CoachViewToggle from "@/components/CoachViewToggle"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface SchemaScore {
  schemaId: string
  schemaName: string
  domain: string
  tscore: number
  percentile: number
  tier: string
  clinical_significance: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low'
  reliability: number
  item_count: number
  rank: number
  is_primary: boolean
  is_secondary: boolean
  is_tertiary: boolean
}

interface SchemaRankingsTabProps {
  coacheeId?: string
  profile?: CoacheeCanonicalProfile | null
}

export default function SchemaRankingsTab({ coacheeId, profile }: SchemaRankingsTabProps) {
  const [schemaScores, setSchemaScores] = useState<SchemaScore[]>([])
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'domains'>('chart')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [coachViewMode, setCoachViewMode] = useState<ViewMode>(
    thresholds.coachToggleDefault ? 'exploratory' : 'strict'
  )
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    console.log(`[SCHEMA_RANKINGS] Component mounted/updated: coacheeId=${coacheeId}, hasProfile=${!!profile}`)
    console.log(`[SCHEMA_RANKINGS] Profile client name: ${profile?.participant?.name || 'N/A'}`)
    if (coacheeId || profile) {
      loadSchemaRankings()
    }
  }, [coacheeId, profile])

  const loadSchemaRankings = async () => {
    try {
      setLoading(true)
      
      // Extract real schema scores from analysis lineage or generate from profile
      const realScores = extractRealSchemaScores(profile)
      setSchemaScores(realScores)
      
    } catch (error) {
      console.error('Error loading schema rankings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeToBridgeV2 = async () => {
    if (!coacheeId) {
      toast.error("No client ID available for upgrade")
      return
    }

    setUpgrading(true)
    toast.loading("Upgrading profile to Bridge V2...", { id: 'upgrade' })

    try {
      const response = await fetch('/api/bridge-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'bridge-all-qa',
          clientId: coacheeId 
        })
      })

      if (response?.ok) {
        const result = await response.json()
        toast.success("Successfully upgraded to Bridge V2!", { id: 'upgrade' })
        
        // Reload the page to reflect the changes
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(`Upgrade failed: ${error?.error || 'Unknown error'}`, { id: 'upgrade' })
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error("Failed to upgrade profile", { id: 'upgrade' })
    } finally {
      setUpgrading(false)
    }
  }

  const extractRealSchemaScores = (profile?: CoacheeCanonicalProfile | null): SchemaScore[] => {
    console.log('[SCHEMA_RANKINGS] 🎯 Using REAL schema rankings from analysis lineage (same source as working tabs)')
    
    if (!profile) {
      console.log('[SCHEMA_RANKINGS] ⚠️ No profile available')
      return []
    }

    // Schema domain mapping (static)
    const schemaDomains: Record<string, string> = {
      'abandonment_instability': 'Disconnection & Rejection',
      'mistrust_abuse': 'Disconnection & Rejection',
      'emotional_deprivation': 'Disconnection & Rejection',
      'defectiveness_shame': 'Disconnection & Rejection',
      'social_isolation_alienation': 'Disconnection & Rejection',
      'dependence_incompetence': 'Impaired Autonomy & Performance',
      'vulnerability_to_harm_illness': 'Impaired Autonomy & Performance',
      'enmeshment_undeveloped_self': 'Impaired Autonomy & Performance',
      'failure': 'Impaired Autonomy & Performance',
      'entitlement_grandiosity': 'Impaired Limits',
      'insufficient_self_control_discipline': 'Impaired Limits',
      'subjugation': 'Other-Directedness',
      'self_sacrifice': 'Other-Directedness',
      'approval_seeking_recognition_seeking': 'Other-Directedness',
      'negativity_pessimism': 'Overvigilance & Inhibition',
      'emotional_inhibition': 'Overvigilance & Inhibition',
      'unrelenting_standards_hypercriticalness': 'Overvigilance & Inhibition',
      'punitiveness': 'Overvigilance & Inhibition'
    }

    // Schema name mapping (static)
    const schemaNames: Record<string, string> = {
      'abandonment_instability': 'Abandonment/Instability',
      'mistrust_abuse': 'Mistrust/Abuse',
      'emotional_deprivation': 'Emotional Deprivation',
      'defectiveness_shame': 'Defectiveness/Shame',
      'social_isolation_alienation': 'Social Isolation/Alienation',
      'dependence_incompetence': 'Dependence/Incompetence',
      'vulnerability_to_harm_illness': 'Vulnerability to Harm',
      'enmeshment_undeveloped_self': 'Enmeshment/Undeveloped Self',
      'failure': 'Failure',
      'entitlement_grandiosity': 'Entitlement/Grandiosity',
      'insufficient_self_control_discipline': 'Insufficient Self-Control',
      'subjugation': 'Subjugation',
      'self_sacrifice': 'Self-Sacrifice',
      'approval_seeking_recognition_seeking': 'Approval-Seeking/Recognition-Seeking',
      'negativity_pessimism': 'Negativity/Pessimism',
      'emotional_inhibition': 'Emotional Inhibition',
      'unrelenting_standards_hypercriticalness': 'Unrelenting Standards/Hypercriticalness',
      'punitiveness': 'Punitiveness'
    }

    // First try to use the real schema rankings from analysis lineage (Bridge V2 data)
    if (profile.analysis_lineage?.schema_rankings?.length) {
      console.log(`[SCHEMA_RANKINGS] ✅ Found ${profile.analysis_lineage.schema_rankings.length} real schema scores in analysis lineage`)
      
      const realScores = profile.analysis_lineage.schema_rankings.map((ranking): SchemaScore => ({
        schemaId: ranking.schemaId,
        schemaName: schemaNames[ranking.schemaId] || ranking.schemaId,
        domain: schemaDomains[ranking.schemaId] || 'Unknown Domain',
        tscore: ranking.tscore,
        percentile: ranking.percentile,
        tier: getTierRange(ranking.tscore),
        clinical_significance: getClinicalSignificance(ranking.tscore),
        reliability: ranking.reliability,
        item_count: ranking.item_count,
        rank: ranking.rank,
        is_primary: ranking.is_primary,
        is_secondary: ranking.is_secondary,
        is_tertiary: ranking.is_tertiary || false
      }))

      console.log(`[SCHEMA_RANKINGS] ✅ Successfully extracted ${realScores.length} real schema scores`)
      console.log(`[SCHEMA_RANKINGS] Primary schemas: ${realScores.filter(s => s.is_primary).map(s => s.schemaId)}`)
      console.log(`[SCHEMA_RANKINGS] Secondary schemas: ${realScores.filter(s => s.is_secondary).map(s => s.schemaId)}`)
      console.log(`[SCHEMA_RANKINGS] Tertiary schemas: ${realScores.filter(s => s.is_tertiary).map(s => s.schemaId)}`)
      console.log(`[SCHEMA_RANKINGS] Highest T-Score: T${Math.max(...realScores.map(s => s.tscore))}`)
      
      return realScores
    }

    // FALLBACK: No analysis lineage found (legacy profiles)
    console.log('[SCHEMA_RANKINGS] ⚠️ No analysis lineage found - profile was created with legacy bridge system')
    console.log('[SCHEMA_RANKINGS] 💡 To enable Schema Rankings visualization, re-import client data using Bridge V2')
    
    return []
  }




  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'very_high': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'very_low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Filter by domain first
  let filteredScores = domainFilter === 'all' 
    ? schemaScores 
    : schemaScores.filter(score => score.domain === domainFilter)

  // Apply coach view mode filtering
  filteredScores = filteredScores.filter(score => {
    const tier = activationTier(score.tscore)
    return isVisibleInViewMode(tier, coachViewMode)
  })

  const domains = Array.from(new Set(schemaScores.map(s => s.domain)))

  const chartData = {
    labels: filteredScores.map(s => s.schemaName.split('/')[0]), // Shortened names
    datasets: [
      {
        label: 'T-Score',
        data: filteredScores.map(s => s.tscore),
        backgroundColor: filteredScores.map(s => {
          if (s.is_primary) return 'rgba(239, 68, 68, 0.8)' // Red for primary
          if (s.is_secondary) return 'rgba(245, 158, 11, 0.8)' // Orange for secondary
          if (s.is_tertiary) return 'rgba(147, 51, 234, 0.8)' // Purple for tertiary
          if (s.tscore >= thresholds.tierRanges.clinical) return 'rgba(239, 68, 68, 0.6)'
          if (s.tscore >= thresholds.tierRanges.atRisk) return 'rgba(245, 158, 11, 0.6)'
          if (s.tscore >= thresholds.tierRanges.moderate) return 'rgba(59, 130, 246, 0.6)'
          return 'rgba(107, 114, 128, 0.4)'
        }),
        borderColor: filteredScores.map(s => {
          if (s.is_primary) return 'rgba(239, 68, 68, 1)'
          if (s.is_secondary) return 'rgba(245, 158, 11, 1)'
          if (s.is_tertiary) return 'rgba(147, 51, 234, 1)'
          if (s.tscore >= thresholds.tierRanges.clinical) return 'rgba(239, 68, 68, 0.8)'
          if (s.tscore >= thresholds.tierRanges.atRisk) return 'rgba(245, 158, 11, 0.8)'
          if (s.tscore >= thresholds.tierRanges.moderate) return 'rgba(59, 130, 246, 0.8)'
          return 'rgba(107, 114, 128, 0.6)'
        }),
        borderWidth: filteredScores.map(s => s.is_primary || s.is_secondary || s.is_tertiary ? 3 : 1)
      }
    ]
  }

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: domainFilter !== 'all' ? `Schema T-Score Rankings - ${domainFilter}` : 'Schema T-Score Rankings'
      },
      tooltip: {
        callbacks: {
          afterLabel: (context) => {
            const score = filteredScores[context.dataIndex]
            const lines = [
              `Rank: #${score.rank}`,
              `Percentile: ${score.percentile}%`,
              `Significance: ${score.clinical_significance.replace('_', ' ').toUpperCase()}`,
              `Items: ${score.item_count}`,
              `Reliability: ${score.reliability}`
            ]
            if (score.is_primary) lines.unshift('PRIMARY SCHEMA')
            if (score.is_secondary) lines.unshift('SECONDARY SCHEMA')
            if (score.is_tertiary) lines.unshift('TERTIARY SCHEMA')
            return lines
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 30,
        max: 85,
        title: {
          display: true,
          text: 'T-Score'
        },
        grid: {
          color: (context) => {
            if (context.tick.value === 70) return 'rgba(239, 68, 68, 0.3)'
            if (context.tick.value === thresholds.active) return 'rgba(245, 158, 11, 0.3)'
            return 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Schema'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading schema rankings...</p>
        </div>
      </div>
    )
  }

  if (!coacheeId && !profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Client Selected
            </h3>
            <p className="text-gray-600">
              Please select a client from the dashboard to view their schema rankings.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (schemaScores.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <Info className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Schema Rankings Not Available
            </h3>
            <p className="text-gray-600 mb-4">
              This client's profile was created with the legacy bridge system and doesn't include comprehensive schema rankings data.
            </p>
            
            {/* Quick Upgrade Button */}
            <div className="mb-4">
              <Button 
                onClick={handleUpgradeToBridgeV2}
                disabled={upgrading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {upgrading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade to Bridge V2
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">Alternative Manual Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to the <strong>Assessment Bridge</strong> page (/bridge)</li>
                <li>Click <strong>"Bridge All (QA Bridge V2)"</strong> - the recommended blue button</li>
                <li>This will regenerate profiles with comprehensive schema analysis</li>
                <li>Return here to view the full schema rankings visualization</li>
              </ol>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              The Leadership and Clinical tabs will continue to work normally with the existing data.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Schema Rankings & Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive T-score analysis of all 18 foundational schemas showing clinical significance and domain patterns
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Coach View Toggle */}
      <CoachViewToggle 
        value={coachViewMode} 
        onChange={setCoachViewMode}
      />

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Chart View</TabsTrigger>
          <TabsTrigger value="table">Detailed Table</TabsTrigger>
          <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 w-full">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
          
          {/* Legend and Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 border-2 border-red-600"></div>
                    <span>Primary Schema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 border-2 border-orange-600"></div>
                    <span>Secondary Schema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400"></div>
                    <span>Clinical Range (T≥{thresholds.tierRanges.clinical})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-400"></div>
                    <span>At-Risk Range (T{thresholds.tierRanges.atRisk}–{thresholds.tierRanges.clinical - 1})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400"></div>
                    <span>Moderate Range (T{thresholds.tierRanges.moderate}–{thresholds.tierRanges.atRisk - 1})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400"></div>
                    <span>Low Range (T&lt;{thresholds.tierRanges.moderate})</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                  Showing {filteredScores.length} of {schemaScores.length} schemas
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Rank</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Schema</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Domain</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">T-Score</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Percentile</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Clinical Significance</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Items</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Reliability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScores.map((score) => (
                      <tr key={score.schemaId} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            {score.rank <= 3 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            #{score.rank}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {score.is_primary && <Star className="h-4 w-4 text-red-500" />}
                              {score.is_secondary && <Star className="h-4 w-4 text-orange-500" />}
                              {score.is_tertiary && <Star className="h-4 w-4 text-purple-600" />}
                              {score.schemaName}
                            </div>
                            <div className="text-xs text-gray-500">{score.schemaId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {score.domain}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">T{score.tscore}</span>
                            <Badge variant="outline" className={
                              score.tscore >= thresholds.tierRanges.clinical ? 'border-red-300 text-red-700' :
                              score.tscore >= thresholds.active ? 'border-orange-300 text-orange-700' : 'border-blue-300 text-blue-700'
                            }>
                              {score.tier}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={score.percentile} className="w-16" />
                            <span>{score.percentile}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={getSignificanceColor(score.clinical_significance)}>
                            {score.clinical_significance.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">{score.item_count}</td>
                        <td className="px-4 py-3">{(score.reliability * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          {domains.map(domain => {
            const domainScores = schemaScores.filter(s => s.domain === domain)
            const avgScore = Math.round(domainScores.reduce((sum, s) => sum + s.tscore, 0) / domainScores.length)
            const highCount = domainScores.filter(s => s.tscore >= thresholds.active).length
            
            return (
              <Card key={domain}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{domain}</CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        Avg: T{avgScore}
                      </Badge>
                      <Badge variant="outline" className={
                        highCount > 0 ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
                      }>
                        {highCount} elevated
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {domainScores.map(score => (
                      <div 
                        key={score.schemaId}
                        className={`p-3 border rounded-lg ${
                          score.is_primary ? 'border-red-300 bg-red-50' :
                          score.is_secondary ? 'border-orange-300 bg-orange-50' :
                          score.is_tertiary ? 'border-purple-300 bg-purple-50' :
                          score.tscore >= thresholds.tierRanges.clinical ? 'border-red-200 bg-red-25' :
                          score.tscore >= thresholds.active ? 'border-orange-200 bg-orange-25' :
                          'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{score.schemaName}</span>
                          <div className="flex items-center gap-1">
                            {score.is_primary && <Star className="h-3 w-3 text-red-500" />}
                            {score.is_secondary && <Star className="h-3 w-3 text-orange-500" />}
                            {score.is_tertiary && <Star className="h-3 w-3 text-purple-600" />}
                            <span className="font-bold">T{score.tscore}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>#{score.rank}</span>
                          <span>{score.percentile}%</span>
                          <Badge variant="outline" className="text-xs">
                            {score.clinical_significance}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}

