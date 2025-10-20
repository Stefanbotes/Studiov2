

"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { AssessmentBridge } from "@/components/assessment-bridge"
import { Loader2 } from "lucide-react"
import { Session } from "next-auth"

interface ClientBridgePageProps {
  session?: Session | null
}

export function ClientBridgePage({ session }: ClientBridgePageProps) {
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
      <main className="p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div>
              <div className="text-xs tracking-[0.2em] font-bold text-rose-800">
                SYSTEM BRIDGE
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                Assessment Bridge
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Connect your uploaded assessment data to the dynamic Coaching Hub system.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <AssessmentBridge />
          </div>
        </div>
      </main>
    </div>
  )
}

