
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, TrendingUp, Calendar, Plus, ArrowRight, Link as LinkIcon, AlertCircle, Upload } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface DashboardStats {
  totalClients: number
  activeEngagements: number
  totalAssessments: number
  recentImports: number
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeEngagements: 0,
    totalAssessments: 0,
    recentImports: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response?.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Clients",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/clients"
    },
    {
      title: "Active Engagements", 
      value: stats?.activeEngagements ?? 0,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/dashboard/engagements"
    },
    {
      title: "Total Assessments",
      value: stats?.totalAssessments ?? 0,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/assessments"
    },

  ]

  return (
    <div className="space-y-8">
      {/* Bridge Notification - Show if we have assessments but need bridging */}
      {stats.totalAssessments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Bridge Your Assessments</h3>
                <p className="text-sm text-gray-600">
                  You have {stats.totalAssessments} uploaded assessment(s). Bridge them to the Coaching Hub for dynamic analysis.
                </p>
              </div>
            </div>
            <Link href="/bridge">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <LinkIcon className="mr-2 h-4 w-4" />
                Bridge Now
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards?.map((card, index) => (
          <motion.div
            key={card?.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <Link href={card?.href ?? ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card?.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card?.bgColor ?? ""}`}>
                    <card.icon className={`h-4 w-4 ${card?.color ?? ""}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={card?.value}
                      >
                        {card?.value ?? 0}
                      </motion.span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-blue-600 transition-colors">
                    View details <ArrowRight className="inline h-3 w-3 ml-1" />
                  </p>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Client Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Manage your client profiles and track their progress across multiple assessment periods.
            </p>
            <div className="flex gap-2">
              <Link href="/clients/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Client
                </Button>
              </Link>
              <Link href="/clients">
                <Button variant="outline">View All Clients</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5 text-green-600" />
              Assessment Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Import JSON assessment files from App A with automatic validation and analysis.
            </p>
            <div className="flex gap-2">
              <Link href="/assessments/import">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Import Assessment
                </Button>
              </Link>
              <Link href="/assessments">
                <Button variant="outline">View Assessments</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
              Schema Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Explore the 18 foundational schemas that drive behavior and leadership patterns.
            </p>
            <div className="flex gap-2">
              <Link href="/schemas">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Explore Schemas
                </Button>
              </Link>
              <Link href="/coaching-hub">
                <Button variant="outline">Coaching Hub</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
