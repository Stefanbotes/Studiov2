
"use client"

import React, { useState, useEffect } from "react"
import { Accordion } from "@/components/coaching/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Search, UserCheck, Calendar, TrendingUp, ArrowRight, Users, Link as LinkIcon, AlertCircle, BarChart3, Brain } from "lucide-react"
import Link from "next/link"
import { CoacheeCanonicalProfile, PersonaSide } from "@/lib/types/canonical-json"
import { 
  mapLeadershipToItems, 
  mapClinicalToItems, 
  mapAdvancedInsightsToItems, 
  mapCoachingToItems 
} from "@/lib/mappers/json-to-accordion"
import SchemaRankingsTab from "@/components/schema-rankings-tab"
import ModeAnalysisTab from "@/components/mode-analysis-tab"
import { ViewMode } from "@/lib/displayPolicy"
import { thresholds } from "@/config/thresholds"
import CoachViewToggle from "@/components/CoachViewToggle"

const badgeClass = (variant: "low" | "moderate" | "high") => {
  if (variant === "low") return "bg-blue-50 text-blue-700 border-blue-200"
  if (variant === "moderate") return "bg-amber-50 text-amber-700 border-amber-200"  
  return "bg-rose-50 text-rose-700 border-rose-200"
}

interface Coachee {
  id: string
  name: string
  email?: string
  org?: string
  title?: string
  primaryPersona?: string
  secondaryPersona?: string
  status?: string
  statusVariant?: "low" | "moderate" | "high"
  nextSession?: string
  progress?: number
  overall?: {
    label: string
    variant: "low" | "moderate" | "high"
  }
  hasProfile?: boolean // New field to track if JSON profile exists
}

interface ParticipantSummaryProps {
  participant?: Coachee | null
  profile?: CoacheeCanonicalProfile | null
  personaSide: PersonaSide
  onPersonaToggle: (side: PersonaSide) => void
}

function ParticipantSummary({ participant, profile, personaSide, onPersonaToggle }: ParticipantSummaryProps) {
  if (!participant) return null

  // Use profile data if available, otherwise fall back to participant data
  const displayData = profile ? {
    name: profile.participant.name,
    email: profile.participant.email,
    org: profile.participant.org,
    title: profile.participant.title,
    overall: profile.participant.overall,
    nextSession: profile.participant.nextSession
  } : participant

  // Check if primary, secondary, and tertiary personas exist
  const hasSecondaryPersona = profile?.leadership?.secondary || profile?.clinical?.secondary || profile !== null
  const hasTertiaryPersona = profile?.leadership?.tertiary || profile?.clinical?.tertiary
  
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs tracking-wider font-bold text-rose-800 uppercase">
              Coachee {profile ? "(JSON Profile Loaded)" : "(Basic Profile)"}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {displayData.name}
            </h2>
            <p className="text-sm text-gray-600">
              {displayData.title && `${displayData.title} • `}
              {displayData.org && `${displayData.org} • `}
              {displayData.email}
            </p>
          </div>
          
          <div className="text-right space-y-2">
            <Badge 
              variant="outline"
              className={badgeClass(displayData.overall?.variant || "moderate")}
            >
              {displayData.overall?.label || "Assessment Required"}
            </Badge>
            <div className="text-xs text-gray-500">
              Next Session: {displayData.nextSession || "TBD"}
            </div>
            
            {/* Primary/Secondary/Tertiary Persona Toggle */}
            {hasSecondaryPersona && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mt-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Persona View
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Switch between {hasTertiaryPersona ? 'primary, secondary, and tertiary' : 'primary and secondary'} assessment perspectives
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onPersonaToggle('primary')}
                      size="sm"
                      variant={personaSide === 'primary' ? 'default' : 'outline'}
                      className={personaSide === 'primary' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    >
                      Primary
                    </Button>
                    <Button
                      onClick={() => onPersonaToggle('secondary')}
                      size="sm"
                      variant={personaSide === 'secondary' ? 'default' : 'outline'}
                      className={personaSide === 'secondary' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    >
                      Secondary
                    </Button>
                    {hasTertiaryPersona && (
                      <Button
                        onClick={() => onPersonaToggle('tertiary')}
                        size="sm"
                        variant={personaSide === 'tertiary' ? 'default' : 'outline'}
                        className={personaSide === 'tertiary' 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      >
                        Tertiary
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardProps {
  coachees: Coachee[]
  onOpen: (coachee: Coachee) => void
  isLoading?: boolean
}

function Dashboard({ coachees, onOpen, isLoading }: DashboardProps) {
  const [query, setQuery] = useState("")
  
  const filtered = coachees.filter((c) => {
    const searchText = (
      c.name + " " + 
      (c.email || "") + " " + 
      (c.org || "") + " " + 
      (c.title || "")
    ).toLowerCase()
    return searchText.includes(query.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Loading clients...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs tracking-wider font-bold text-rose-800 uppercase">
                Dashboard
              </div>
              <CardTitle className="text-3xl">Coachees</CardTitle>
              <CardDescription>
                Quick overview and entry point to each client report.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, or organization..."
                  className="pl-10 min-w-[280px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Org / Title</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Profile Status</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Overall Assessment</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Next Session</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Progress</th>
                  <th className="px-4 py-3 font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-900">{c.org || "—"}</div>
                      <div className="text-xs text-gray-500">{c.title || "—"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant="outline"
                        className={c.hasProfile ? 
                          "bg-green-50 text-green-700 border-green-200" : 
                          "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {c.hasProfile ? "JSON Profile" : "Basic Only"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant="outline"
                        className={badgeClass(c.overall?.variant || "moderate")}
                      >
                        {c.overall?.label || "Assessment Required"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant="outline"
                        className={badgeClass(c.statusVariant || "moderate")}
                      >
                        {c.status || "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {c.nextSession || "TBD"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2 transition-all duration-300" 
                          style={{ width: `${c.progress || 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {c.progress || 0}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button 
                        onClick={() => onOpen(c)}
                        size="sm"
                        className={c.hasProfile ? 
                          "bg-indigo-600 hover:bg-indigo-700" : 
                          "bg-gray-400 hover:bg-gray-500"
                        }
                      >
                        Open
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="px-4 py-12 text-center">
                        {query ? (
                          <div className="text-gray-500">No matches found</div>
                        ) : (
                          <div className="max-w-md mx-auto space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Coaching Profiles Yet
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                To see clients here, you need to bridge your uploaded assessments to the Coaching Hub.
                                This converts your assessment data into dynamic coaching profiles.
                              </p>
                              <Link href="/bridge">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                                  <LinkIcon className="mr-2 h-4 w-4" />
                                  Bridge Assessments Now
                                </Button>
                              </Link>
                            </div>
                            <div className="text-xs text-gray-500">
                              Already have uploaded assessments? Use the Bridge Tool to connect them here.
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function IntegratedCoachingHub() {
  const [mainTab, setMainTab] = useState("dashboard")
  const [coachingSubTab, setCoachingSubTab] = useState<"coaching_plan" | "session_log" | "additional_insights">("coaching_plan")
  const [activeClient, setActiveClient] = useState<Coachee | null>(null)
  const [activeProfile, setActiveProfile] = useState<CoacheeCanonicalProfile | null>(null)
  const [personaSide, setPersonaSide] = useState<PersonaSide>("primary")
  const [clients, setClients] = useState<Coachee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [coachViewMode, setCoachViewMode] = useState<ViewMode>(
    thresholds.coachToggleDefault ? 'exploratory' : 'strict'
  )

  // Fetch clients and their JSON profiles
  useEffect(() => {
    fetchClients()
    // Auto-load sample profile for demonstration
    loadSampleProfile()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        
        // Check which clients have JSON profiles
        const profileResponse = await fetch("/api/coachee-profiles")
        const profileData = await profileResponse.json()
        const existingProfileIds = profileData.profileIds || []
        
        // Transform the client data to match our Coachee interface
        const transformedClients: Coachee[] = data.clients.map((client: any) => ({
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          org: client.organization,
          title: client.role,
          primaryPersona: "Assessment Required",
          secondaryPersona: undefined,
          status: client.isActive ? "Active" : "Inactive",
          statusVariant: client.isActive ? "low" : "moderate" as const,
          nextSession: "TBD",
          progress: Math.floor(Math.random() * 100),
          hasProfile: existingProfileIds.includes(client.id),
          overall: {
            label: "Assessment Required",
            variant: "moderate" as const
          }
        }))
        
        setClients(transformedClients)
        
        // Set first client as active if none selected
        if (!activeClient && transformedClients.length > 0) {
          setActiveClient(transformedClients[0])
          loadCoacheeProfile(transformedClients[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load JSON profile for a specific coachee
  const loadCoacheeProfile = async (coacheeId: string) => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch(`/api/coachee-profiles?coacheeId=${coacheeId}`)
      if (response.ok) {
        const { profile } = await response.json()
        setActiveProfile(profile)
        setPersonaSide("primary") // Reset to primary when switching clients
      } else {
        setActiveProfile(null)
      }
    } catch (error) {
      console.error("Error loading coachee profile:", error)
      setActiveProfile(null)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Load sample profile for demonstration  
  const loadSampleProfile = async () => {
    try {
      // Load the sample profile from our JSON file
      const response = await fetch('/data/sample-coachee-profile.json')
      const sampleProfile = await response.json()
      
      // Store it with a demo ID that matches a client ID
      // For now, we'll use a fixed demo ID that should match a client
      await fetch("/api/coachee-profiles", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coacheeId: "demo-ingra",
          profile: sampleProfile
        })
      })
    } catch (error) {
      console.error("Error loading sample profile:", error)
    }
  }

  // Dynamic workflow sections using mapper functions
  const getLeadershipItems = () => {
    if (!activeProfile) {
      return mapLeadershipToItems(undefined, personaSide, coachViewMode)
    }
    const leadershipData = activeProfile.leadership?.[personaSide]
    const schemaRankings = activeProfile.analysis_lineage?.schema_rankings
    return mapLeadershipToItems(leadershipData, personaSide, coachViewMode, schemaRankings)
  }

  const getClinicalItems = () => {
    if (!activeProfile) {
      return mapClinicalToItems(undefined, personaSide, coachViewMode)
    }
    const clinicalData = activeProfile.clinical?.[personaSide]
    const schemaRankings = activeProfile.analysis_lineage?.schema_rankings
    return mapClinicalToItems(clinicalData, personaSide, coachViewMode, schemaRankings)
  }

  const getAdvancedInsightsItems = () => {
    return mapAdvancedInsightsToItems(activeProfile)
  }

  const getCoachingItems = (section: "coaching_plan" | "session_log" | "additional_insights") => {
    return mapCoachingToItems(activeProfile, section)
  }

  const handleOpenClient = async (client: Coachee) => {
    setActiveClient(client)
    setMainTab("leadership")
    
    // Load the JSON profile for this client
    await loadCoacheeProfile(client.id)
  }

  const renderMainContent = () => {
    if (mainTab === "dashboard") {
      return (
        <Dashboard
          coachees={clients}
          isLoading={isLoading}
          onOpen={handleOpenClient}
        />
      )
    }

    if (isLoadingProfile) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">Loading profile data...</span>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <ParticipantSummary 
          participant={activeClient} 
          profile={activeProfile}
          personaSide={personaSide}
          onPersonaToggle={setPersonaSide}
        />

        {/* Show coach view toggle for content tabs */}
        {(mainTab === "leadership" || mainTab === "clinical") && (
          <CoachViewToggle 
            value={coachViewMode} 
            onChange={setCoachViewMode}
          />
        )}

        {mainTab === "leadership" && (
          <Accordion 
            items={getLeadershipItems()} 
            defaultOpenKeys={["unmet_need"]} 
          />
        )}

        {mainTab === "clinical" && (
          <Accordion 
            items={getClinicalItems()} 
            defaultOpenKeys={["Core_Needs_Frustrated"]} 
          />
        )}

        {mainTab === "advanced_insights" && (
          <Accordion
            items={getAdvancedInsightsItems()}
            defaultOpenKeys={["advanced_insights"]}
          />
        )}

        {mainTab === "coaching" && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => setCoachingSubTab("coaching_plan")}
                variant={coachingSubTab === "coaching_plan" ? "default" : "outline"}
                size="sm"
                className={coachingSubTab === "coaching_plan" ? 
                  "bg-emerald-600 hover:bg-emerald-700" : ""
                }
              >
                Coaching Plan
              </Button>
              <Button
                onClick={() => setCoachingSubTab("session_log")}
                variant={coachingSubTab === "session_log" ? "default" : "outline"}
                size="sm"
                className={coachingSubTab === "session_log" ? 
                  "bg-emerald-600 hover:bg-emerald-700" : ""
                }
              >
                Session Log
              </Button>
              <Button
                onClick={() => setCoachingSubTab("additional_insights")}
                variant={coachingSubTab === "additional_insights" ? "default" : "outline"}
                size="sm"
                className={coachingSubTab === "additional_insights" ? 
                  "bg-emerald-600 hover:bg-emerald-700" : ""
                }
              >
                Additional Insights
              </Button>
            </div>
            
            <Accordion
              items={getCoachingItems(coachingSubTab)}
              defaultOpenKeys={[coachingSubTab]}
            />
          </div>
        )}

        {mainTab === "schema_rankings" && (
          <SchemaRankingsTab 
            key={`schema-rankings-${activeClient?.id}-${activeProfile?.participant?.name}`}
            coacheeId={activeClient?.id} 
            profile={activeProfile}
          />
        )}

        {mainTab === "mode_analysis" && (
          <ModeAnalysisTab 
            key={`mode-analysis-${activeClient?.id}-${personaSide}`}
            profile={activeProfile}
            personaSide={personaSide}
          />
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="space-y-3">
              <div className="text-xs tracking-wider font-bold text-rose-800 uppercase">
                Leadership & Clinical Workflows
              </div>
              <CardTitle className="text-3xl md:text-4xl">
                Integrated Coaching & Insights Hub
              </CardTitle>
              <CardDescription className="text-base">
                Comprehensive framework combining dashboard, leadership analysis, clinical insights, and coaching process management.
              </CardDescription>

              {/* Main navigation tabs */}
              <div className="flex gap-2 flex-wrap pt-2">
                <Button
                  onClick={() => setMainTab("dashboard")}
                  variant={mainTab === "dashboard" ? "default" : "outline"}
                  size="sm"
                  className={mainTab === "dashboard" ? 
                    "bg-indigo-600 hover:bg-indigo-700" : ""
                  }
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  onClick={() => setMainTab("leadership")}
                  variant={mainTab === "leadership" ? "default" : "outline"}
                  size="sm"
                  className={mainTab === "leadership" ? 
                    "bg-indigo-600 hover:bg-indigo-700" : ""
                  }
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Leadership Frame
                </Button>
                <Button
                  onClick={() => setMainTab("clinical")}
                  variant={mainTab === "clinical" ? "default" : "outline"}
                  size="sm"
                  className={mainTab === "clinical" ? 
                    "bg-indigo-600 hover:bg-indigo-700" : ""
                  }
                >
                  Clinical Frame
                </Button>
                <Button
                  onClick={() => setMainTab("advanced_insights")}
                  variant={mainTab === "advanced_insights" ? "default" : "outline"}
                  size="sm"
                  className={mainTab === "advanced_insights" ? 
                    "bg-indigo-600 hover:bg-indigo-700" : ""
                  }
                >
                  Advanced Insights
                </Button>
                <Button
                  onClick={() => setMainTab("coaching")}
                  variant={mainTab === "coaching" ? "default" : "outline"}
                  size="sm"
                  className={mainTab === "coaching" ? 
                    "bg-indigo-600 hover:bg-indigo-700" : ""
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Coaching Process
                </Button>
                <Button
                  onClick={() => setMainTab("schema_rankings")}
                  variant={mainTab === "schema_rankings" ? "default" : "outline"}
                  size="sm"
                  className={mainTab === "schema_rankings" ? 
                    "bg-indigo-600 hover:bg-indigo-700" : ""
                  }
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Schema Rankings
                </Button>
                <Button
                  onClick={() => setMainTab("mode_analysis")}
                  variant={mainTab === "mode_analysis" ? "default" : "outline"}
                  size="sm"
                  className={mainTab === "mode_analysis" ? 
                    "bg-purple-600 hover:bg-purple-700" : ""
                  }
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Mode Analysis
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main content */}
        {renderMainContent()}

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center pt-8">
          Integrated coaching hub with comprehensive workflow management.
        </p>
      </div>
    </main>
  )
}
