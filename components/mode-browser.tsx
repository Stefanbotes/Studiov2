
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Brain, Heart, Shield, Target, Smile, Frown, AlertTriangle } from 'lucide-react'

interface Mode {
  id: string
  name: string
  type: string
  linkedSchemas: string[]
  copingStrategy: string
  category: string
  isAdaptive?: boolean
}

interface ModeLibraryData {
  modes: Mode[]
  metadata: {
    version: string
    createdAt: string
    description: string
  }
  count: number
}

export default function ModeBrowser() {
  const [modeLibrary, setModeLibrary] = useState<ModeLibraryData | null>(null)
  const [filteredModes, setFilteredModes] = useState<Mode[]>([])
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Fetch all modes
  useEffect(() => {
    fetch('/api/modes')
      .then(res => res.json())
      .then(data => {
        setModeLibrary(data)
        setFilteredModes(data.modes || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load modes:', err)
        setLoading(false)
      })
  }, [])

  // Filter modes based on search and category
  useEffect(() => {
    if (!modeLibrary) return

    let filtered = modeLibrary.modes

    if (searchTerm) {
      filtered = filtered.filter(mode =>
        mode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mode.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mode.copingStrategy.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(mode => mode.category === categoryFilter)
    }

    setFilteredModes(filtered)
  }, [modeLibrary, searchTerm, categoryFilter])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'child_modes': return <Heart className="h-5 w-5" />
      case 'coping_modes': return <Shield className="h-5 w-5" />
      case 'parent_modes': return <AlertTriangle className="h-5 w-5" />
      case 'adaptive_modes': return <Smile className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'child_modes': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'coping_modes': return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'parent_modes': return 'bg-red-100 text-red-800 border-red-300'
      case 'adaptive_modes': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'child_modes': return 'Child Modes'
      case 'coping_modes': return 'Coping Modes'
      case 'parent_modes': return 'Parent Modes'
      case 'adaptive_modes': return 'Adaptive Modes'
      default: return category
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mode library...</p>
        </div>
      </div>
    )
  }

  const categories = Array.from(new Set(modeLibrary?.modes.map(m => m.category) || []))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mode Library</h2>
        <p className="text-muted-foreground mt-2">
          Schema therapy modes with linked schemas and coping strategies
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search modes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredModes.length} of {modeLibrary?.count || 0} modes
          </div>
        </CardContent>
      </Card>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode List */}
        <div className="space-y-4">
          <ScrollArea className="h-[600px] pr-4">
            {filteredModes.map(mode => (
              <Card 
                key={mode.id}
                className={`mb-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedMode?.id === mode.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedMode(mode)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(mode.category)}`}>
                        {getCategoryIcon(mode.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mode.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {mode.type}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    {mode.isAdaptive && (
                      <Badge className="bg-green-500">Adaptive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mode.copingStrategy}
                  </p>
                  {mode.linkedSchemas.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>{mode.linkedSchemas.length} linked schemas</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>

        {/* Mode Details */}
        <div>
          {selectedMode ? (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${getCategoryColor(selectedMode.category)}`}>
                    {getCategoryIcon(selectedMode.category)}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedMode.name}</CardTitle>
                    <CardDescription className="mt-2">
                      <Badge variant="outline">{selectedMode.type}</Badge>
                      {selectedMode.isAdaptive && (
                        <Badge className="ml-2 bg-green-500">Adaptive</Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Category
                  </h4>
                  <Badge className={getCategoryColor(selectedMode.category)}>
                    {getCategoryLabel(selectedMode.category)}
                  </Badge>
                </div>

                {/* Coping Strategy */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Coping Strategy / Expression</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedMode.copingStrategy}
                  </p>
                </div>

                {/* Linked Schemas */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Linked Schemas ({selectedMode.linkedSchemas.length})
                  </h4>
                  {selectedMode.linkedSchemas.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMode.linkedSchemas.map(schemaId => (
                        <Badge 
                          key={schemaId} 
                          variant="secondary"
                          className="mr-2 mb-2"
                        >
                          {schemaId.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No specific schemas linked (Adaptive mode)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <Brain className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">
                  Select a mode to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
