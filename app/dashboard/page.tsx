

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardOverview } from "@/components/dashboard-overview"

// Force dynamic rendering - never statically optimize this page
// This ensures session checks always happen at runtime, not build time
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-600 mt-2">
          Professional dashboard for client assessment and progress tracking
        </p>
      </div>
      
      <DashboardOverview />
    </div>
  )
}
