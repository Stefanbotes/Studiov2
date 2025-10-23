

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ClientCoachingHub } from "@/components/client-coaching-hub"

export default async function CoachingHubPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return <ClientCoachingHub session={session} />
}
