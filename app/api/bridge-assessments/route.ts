
// API endpoint to bridge uploaded assessments to the coaching hub

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { bridgeUserAssessments, bridgeAssessmentToHub } from "@/lib/utils/bridge-assessment-to-hub"
import { listCoacheeProfiles, hasCoacheeProfile } from "@/lib/services/coachee-profiles"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, filePath, clientId, useQABridge = true } = body

    console.log(`[BRIDGE_API] Action: ${action}, QA Bridge: ${useQABridge}`)

    if (action === "bridge-single" && filePath) {
      // Bridge a specific assessment file
      const result = await bridgeAssessmentToHub(filePath, clientId)
      return NextResponse.json(result)
      
    } else if (action === "bridge-all" || action === "bridge-all-qa") {
      // Bridge V2 only - Force QA Bridge for all assessments
      console.log(`[BRIDGE_API] Using Bridge V2 for user: ${session.user.id}`)
      const results = await bridgeUserAssessments(session.user.id)
      return NextResponse.json({
        ...results,
        bridge_version: 'Bridge-v2.1.0',
        processing_notes: [
          'Used Bridge V2 with immutable contracts',
          'Applied deterministic schema selection',
          'Content resolver with fail-closed validation',
          ...results.messages
        ]
      })
      
    } else if (action === "list-profiles") {
      // List all available coachee profiles
      const profileIds = await listCoacheeProfiles()
      return NextResponse.json({ profileIds })
      
    } else if (action === "check-profile" && clientId) {
      // Check if a client has a coachee profile
      const hasProfile = await hasCoacheeProfile(clientId)
      return NextResponse.json({ hasProfile, clientId })
      
    } else {
      return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 })
    }

  } catch (error) {
    console.error("Error in bridge-assessments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return current status of bridged profiles
    const profileIds = await listCoacheeProfiles()
    
    return NextResponse.json({ 
      profileIds,
      count: profileIds.length,
      message: "Current coachee profiles in the system"
    })

  } catch (error) {
    console.error("Error in bridge-assessments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
