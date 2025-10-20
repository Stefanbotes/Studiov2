
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Brain, Heart, User, Target, AlertTriangle, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface SchemaData {
  id: string
  name: string
  domain: string
  leadershipPersona: string
  healthyPersona: string
  coreNeeds: string
}

interface DetailedSchema {
  schemaId: string
  leadership: any
  clinical: any
  metadata: any
}

interface Mode {
  id: string
  name: string
  type: string
  linkedSchemas: string[]
  copingStrategy: string
  category: string
  isAdaptive?: boolean
}

export default function SchemaBrowser() {
  const [schemas, setSchemas] = useState<SchemaData[]>([])
  const [filteredSchemas, setFilteredSchemas] = useState<SchemaData[]>([])
  const [selectedSchema, setSelectedSchema] = useState<DetailedSchema | null>(null)
  const [relatedModes, setRelatedModes] = useState<Mode[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Fetch all schemas
  useEffect(() => {
    fetch('/api/schemas')
      .then(res => res.json())
      .then(data => {
        setSchemas(data.schemas || [])
        setFilteredSchemas(data.schemas || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load schemas:', err)
        setLoading(false)
      })
  }, [])

  // Filter schemas based on search and domain
  useEffect(() => {
    let filtered = schemas

    if (searchTerm) {
      filtered = filtered.filter(schema =>
        schema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schema.leadershipPersona.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schema.coreNeeds.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (domainFilter !== 'all') {
      filtered = filtered.filter(schema => schema.domain === domainFilter)
    }

    setFilteredSchemas(filtered)
  }, [schemas, searchTerm, domainFilter])

  const handleSchemaSelect = async (schemaId: string) => {
    setLoadingDetails(true)
    try {
      // Fetch schema details
      const schemaResponse = await fetch(`/api/schemas?id=${schemaId}`)
      const schemaData = await schemaResponse.json()
      setSelectedSchema(schemaData)
      
      // Fetch related modes
      const modesResponse = await fetch(`/api/modes?schemaId=${schemaId}`)
      const modesData = await modesResponse.json()
      setRelatedModes(modesData.modes || [])
    } catch (err) {
      console.error('Failed to load schema details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const domains = Array.from(new Set(schemas.map(s => s.domain))).filter(Boolean)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schema library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search schemas, personas, or needs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-full md:w-64">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Schema Library ({filteredSchemas.length})
            </CardTitle>
            <CardDescription>
              Explore the foundational schemas that drive behavior and leadership patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredSchemas.map((schema) => (
                  <div
                    key={schema.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSchema?.schemaId === schema.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSchemaSelect(schema.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{schema.name || schema.id}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {schema.domain}
                      </Badge>
                    </div>
                    {schema.leadershipPersona && (
                      <p className="text-xs text-gray-600 mb-1">
                        <User className="inline h-3 w-3 mr-1" />
                        {schema.leadershipPersona}
                      </p>
                    )}
                    {schema.coreNeeds && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        <Heart className="inline h-3 w-3 mr-1" />
                        {schema.coreNeeds}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Schema Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Schema Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : selectedSchema ? (
              <Tabs defaultValue="leadership" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="leadership">Leadership</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical</TabsTrigger>
                  <TabsTrigger value="modes">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Modes ({relatedModes.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="leadership" className="space-y-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-4 pr-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Schema Information</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p><strong>Name:</strong> {selectedSchema.leadership?.schema_name || 'N/A'}</p>
                          <p><strong>Domain:</strong> {selectedSchema.leadership?.schema_domain || 'N/A'}</p>
                          <p><strong>Tier 2 Name:</strong> {selectedSchema.leadership?.tier2_name || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Core Patterns
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-red-50 p-3 rounded text-sm">
                            <p className="font-medium text-red-700">Unmet Need</p>
                            <p>{selectedSchema.leadership?.unmet_need || 'N/A'}</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <p className="font-medium text-blue-700">Leadership Persona</p>
                            <p>{selectedSchema.leadership?.leadership_persona || 'N/A'}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded text-sm">
                            <p className="font-medium text-green-700">Healthy Persona</p>
                            <p>{selectedSchema.leadership?.healthy_persona || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Behavioral Modes</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Surrender:</p>
                            <p className="text-gray-600">{selectedSchema.leadership?.surrender_behavior || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Avoidance:</p>
                            <p className="text-gray-600">{selectedSchema.leadership?.avoidance_behavior || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Overcompensation:</p>
                            <p className="text-gray-600">{selectedSchema.leadership?.overcompensation_behavior || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Leadership Impact</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Impact on Team:</p>
                            <p className="text-gray-600">{selectedSchema.leadership?.impact_on_team || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Decision Making Style:</p>
                            <p className="text-gray-600">{selectedSchema.leadership?.decision_making_style || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">LIOS Interpretation:</p>
                            <p className="text-gray-600">{selectedSchema.leadership?.lios_interpretation || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="clinical" className="space-y-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-4 pr-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Clinical Framework</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p><strong>Core Needs:</strong> {selectedSchema.clinical?.core_needs || 'N/A'}</p>
                          <p><strong>Developmental Window:</strong> {selectedSchema.clinical?.dev_window || 'N/A'}</p>
                          <p><strong>Attachment:</strong> {selectedSchema.clinical?.attachment || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Primary Experiences</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Primary Thought:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.thought || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Primary Emotion:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.emotion || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Primary Belief:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.belief || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Bodily Anchor:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.bodily || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          Defensive Patterns
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Core Threat:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.threat || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Primary Defenses:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.defenses || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Surrender Mode:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.surrender_mode || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Avoidance Mode:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.avoidance_mode || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Overcompensation Mode:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.overcomp_mode || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Neurocognitive Profile</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Memory Systems:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.memory || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Regulatory Profile:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.regulatory || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Maintaining Biases:</p>
                            <p className="text-gray-600">{selectedSchema.clinical?.biases || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="modes" className="space-y-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Modes linked to {selectedSchema.leadership?.schema_name || selectedSchema.schemaId}
                      </p>
                      <Link href="/modes">
                        <Button variant="outline" size="sm">
                          View Mode Library
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <ScrollArea className="h-80">
                    <div className="space-y-4 pr-4">
                      {relatedModes.length > 0 ? (
                        relatedModes.map(mode => (
                          <Card key={mode.id} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">{mode.name}</CardTitle>
                                  <CardDescription className="mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {mode.type}
                                    </Badge>
                                    {mode.isAdaptive && (
                                      <Badge className="ml-2 bg-green-500 text-xs">Adaptive</Badge>
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div>
                                  <h5 className="text-sm font-semibold mb-1">Coping Strategy</h5>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mode.copingStrategy}
                                  </p>
                                </div>
                                <div className="pt-2">
                                  <Badge 
                                    variant="secondary"
                                    className={
                                      mode.category === 'child_modes' ? 'bg-blue-100 text-blue-800' :
                                      mode.category === 'coping_modes' ? 'bg-amber-100 text-amber-800' :
                                      mode.category === 'parent_modes' ? 'bg-red-100 text-red-800' :
                                      'bg-green-100 text-green-800'
                                    }
                                  >
                                    {mode.category.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-muted-foreground mb-4">
                            No modes are directly linked to this schema.
                          </p>
                          <Link href="/modes">
                            <Button variant="outline">
                              Explore Mode Library
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a schema from the list to view details</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
