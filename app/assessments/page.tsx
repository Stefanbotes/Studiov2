
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, parseISO } from "date-fns"
import Link from "next/link"
import { FileText, Upload, Clock, User } from "lucide-react"

export default async function AssessmentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return <div>Please log in</div>
  }

  // Get all assessments for the current user's clients
  const assessments = await prisma.assessmentImport.findMany({
    where: {
      client: {
        userId: session.user.id
      }
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      results: {
        take: 1,
        orderBy: { computedAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessment Overview</h1>
          <p className="text-gray-600 mt-2">
            View and manage all imported assessments across your client base
          </p>
        </div>
        <Link href="/assessments/import">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Import Assessment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(assessments.map((a: any) => a.clientId)).size}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Recent Imports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments.filter((a: any) => 
                new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-gray-500">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">All Assessments</h2>
        
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-500 mb-4">
                Start by importing your first assessment from App A
              </p>
              <Link href="/assessments/import">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Import First Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assessments.map((assessment: any) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <Link 
                          href={`/clients/${assessment.clientId}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {assessment.client.firstName} {assessment.client.lastName}
                        </Link>
                        <Badge variant="secondary">
                          {assessment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Assessment ID:</span> {assessment.assessmentId}
                        </div>
                        <div>
                          <span className="font-medium">Completed:</span>{" "}
                          {new Date(assessment.completedAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Schema Version:</span> {assessment.schemaVersion}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="w-3 h-3 mr-1" />
                        Imported {formatDistanceToNow(new Date(assessment.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {assessment.results.length > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Analyzed
                        </Badge>
                      )}
                      <Link href={`/clients/${assessment.clientId}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
