
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log('🔐 Dashboard Layout - Session check:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
  })

  if (!session) {
    console.log('⚠️  No session found, redirecting to login...')
    redirect("/auth/login")
  }

  console.log('✅ Session valid, rendering dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
