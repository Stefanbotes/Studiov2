
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import { ClientProfile } from "@/components/client-profile"

interface PageProps {
  params: { id: string }
}

export default async function ClientProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const client = await prisma.clientProfile.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      engagements: {
        include: {
          imports: {
            include: {
              results: true
            },
            orderBy: { createdAt: 'desc' }
          },
          plans: {
            orderBy: { createdAt: 'desc' }
          },
          notes: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { startedAt: 'desc' }
      },
      assessmentImports: {
        include: {
          results: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!client) {
    notFound()
  }

  // Convert dates to strings for client-side consumption
  const clientWithStringDates = {
    ...client,
    createdAt: client.createdAt.toISOString(),
    engagements: client.engagements.map((engagement: any) => ({
      ...engagement,
      startedAt: engagement.startedAt.toISOString(),
      endedAt: engagement.endedAt?.toISOString() || null,
      imports: engagement.imports.map((imp: any) => ({
        ...imp,
        createdAt: imp.createdAt.toISOString(),
        completedAt: imp.completedAt.toISOString()
      })),
      plans: engagement.plans.map((plan: any) => ({
        ...plan,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString()
      })),
      notes: engagement.notes.map((note: any) => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        sessionDate: note.sessionDate.toISOString()
      }))
    })),
    assessmentImports: client.assessmentImports.map((imp: any) => ({
      ...imp,
      createdAt: imp.createdAt.toISOString(),
      completedAt: imp.completedAt.toISOString()
    }))
  }

  return <ClientProfile client={clientWithStringDates} />
}
