

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ClientBridgePage } from "@/components/client-bridge-page"

export default async function BridgePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <ClientBridgePage session={session} />
}
