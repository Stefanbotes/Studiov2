
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { ClientEditForm } from "@/components/client-edit-form"

export default async function ClientEditPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const client = await prisma.clientProfile.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    }
  })

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Client Profile
        </h1>
        <p className="text-gray-600 mt-2">
          Update {client.firstName} {client.lastName}'s profile information
        </p>
      </div>

      <ClientEditForm client={client} />
    </div>
  )
}
