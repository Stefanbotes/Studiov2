
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Users, Clock, FileText, Activity } from "lucide-react"

export default async function EngagementsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return <div>Please log in</div>
  }

  // Get all engagements for the current user's clients
  const engagements = await prisma.engagement.findMany({
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
      imports: {
        select: {
          id: true,
          assessmentId: true,
          createdAt: true
        }
      },
      _count: {
        select: {
          imports: true,
          events: true
        }
      }
    },
    orderBy: { startedAt: 'desc' }
  })

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'INTAKE': return 'bg-blue-100 text-blue-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Engagements</h1>
        <p className="text-gray-600 mt-2">
          Track longitudinal client engagements and their assessment timeline
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagements.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {engagements.filter((e: any) => e.phase === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {engagements.filter((e: any) => e.phase === 'REVIEW').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagements.reduce((sum: number, e: any) => sum + e._count.imports, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagements List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">All Engagements</h2>
        
        {engagements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No engagements yet</h3>
              <p className="text-gray-500 mb-4">
                Engagements are automatically created when you import assessments for clients
              </p>
              <Link href="/clients/new">
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Add First Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {engagements.map((engagement: any) => (
              <Card key={engagement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <Link 
                        href={`/clients/${engagement.clientId}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {engagement.client.firstName} {engagement.client.lastName}
                      </Link>
                      <Badge className={getPhaseColor(engagement.phase)}>
                        {engagement.phase}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {engagement._count.imports} assessments
                      </Badge>
                      <Link href={`/clients/${engagement.clientId}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        Started {formatDistanceToNow(new Date(engagement.startedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {engagement._count.imports} assessment imports
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {engagement._count.events} activities
                      </span>
                    </div>
                  </div>

                  {engagement.description && (
                    <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded">
                      {engagement.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
