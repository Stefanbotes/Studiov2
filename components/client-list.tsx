
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Search, 
  Calendar, 
  FileText, 
  MoreVertical,
  Filter,
  Users
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ClientProfile {
  id: string
  firstName: string
  lastName: string
  email: string | null
  role: string | null
  ageRange: string | null
  isActive: boolean
  createdAt: string
  _count: {
    engagements: number
    assessmentImports: number
  }
}

export function ClientList() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (response?.ok) {
          const data = await response.json()
          setClients(data?.clients || [])
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  const filteredClients = clients?.filter((client) => {
    const matchesSearch = 
      `${client?.firstName} ${client?.lastName}`.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      client?.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      client?.role?.toLowerCase().includes(searchTerm?.toLowerCase())
    
    const matchesFilter = 
      filter === "all" || 
      (filter === "active" && client?.isActive) ||
      (filter === "inactive" && !client?.isActive)

    return matchesSearch && matchesFilter
  }) || []

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 })?.map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value || "")}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption as typeof filter)}
              className="capitalize"
            >
              <Filter className="mr-2 h-3 w-3" />
              {filterOption}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredClients?.length || 0} client{filteredClients?.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Client Cards Grid */}
      {filteredClients?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first client"}
            </p>
            <Link href="/clients/new">
              <Button>Add New Client</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients?.map((client, index) => (
            <motion.div
              key={client?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {client?.firstName} {client?.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{client?.email || "No email"}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link href={`/clients/${client?.id}`}>View Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/clients/${client?.id}/edit`}>Edit Client</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/assessments/import?clientId=${client?.id}`}>Import Assessment</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Role:</span>
                      <Badge variant="secondary">{client?.role || "Not specified"}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Age Range:</span>
                      <span>{client?.ageRange || "Not specified"}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge 
                        variant={client?.isActive ? "default" : "secondary"}
                        className={client?.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {client?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-600">
                          {client?._count?.engagements || 0} engagement{client?._count?.engagements !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-600">
                          {client?._count?.assessmentImports || 0} assessment{client?._count?.assessmentImports !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/clients/${client?.id}`}>
                        <Button variant="outline" size="sm" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
