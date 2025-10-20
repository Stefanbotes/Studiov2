
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  Plus,
  TrendingUp,
  Clock,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface ClientProfileProps {
  client: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    role: string | null
    ageRange: string | null
    aspirations: string | null
    pseudonym: string | null
    isActive: boolean
    createdAt: string
    engagements: any[]
    assessmentImports: any[]
  }
}

export function ClientProfile({ client }: ClientProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString)?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {client?.firstName} {client?.lastName}
              {client?.pseudonym && (
                <span className="text-gray-500 ml-2">({client.pseudonym})</span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Client Profile & Assessment Timeline</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${client?.id}/edit`}>
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge 
                    variant={client?.isActive ? "default" : "secondary"}
                    className={client?.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {client?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{client?.role || "Not specified"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Age Range:</span>
                  <span className="font-medium">{client?.ageRange || "Not specified"}</span>
                </div>

                {client?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}

                {client?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Client since {formatDate(client?.createdAt || "")}</span>
                </div>
              </div>

              {client?.aspirations && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Development Goals:</h4>
                  <p className="text-sm text-gray-600">{client.aspirations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Engagements:</span>
                  <span className="font-bold text-lg">{client?.engagements?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Assessments:</span>
                  <span className="font-bold text-lg">{client?.assessmentImports?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Latest Import:</span>
                  <span className="text-sm">
                    {client?.assessmentImports?.[0] 
                      ? formatDate(client.assessmentImports[0].createdAt)
                      : "No imports yet"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-purple-600" />
                Assessment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client?.assessmentImports?.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600 mb-4">
                    No assessment data available for this client
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {client?.assessmentImports?.map((assessment, index) => (
                    <motion.div
                      key={assessment?.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Assessment {assessment?.assessmentId}</h4>
                          <Badge 
                            variant={assessment?.status === "VALIDATED" ? "default" : "secondary"}
                            className={assessment?.status === "VALIDATED" ? "bg-green-100 text-green-800" : ""}
                          >
                            {assessment?.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(assessment?.createdAt || "")}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Respondent ID: {assessment?.respondentId}</p>
                        <p>Schema Version: {assessment?.schemaVersion}</p>
                        <p>Completed: {formatDate(assessment?.completedAt || "")}</p>
                        {assessment?.results?.length > 0 && (
                          <p className="text-green-600 font-medium">
                            ✓ Analysis results available
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
