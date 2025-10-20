
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ClientList } from "@/components/client-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your client profiles and track assessment progress
          </p>
        </div>
        <Link href="/clients/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </Link>
      </div>

      <ClientList />
    </div>
  )
}
