
"use client"

import { useState, useEffect } from "react"
import IntegratedCoachingHub from "@/components/integrated-coaching-hub"
import { Header } from "@/components/header"
import { Loader2 } from "lucide-react"
import { Session } from "next-auth"

interface ClientCoachingHubProps {
  session?: Session | null
}

export function ClientCoachingHub({ session }: ClientCoachingHubProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <IntegratedCoachingHub />
    </div>
  )
}
