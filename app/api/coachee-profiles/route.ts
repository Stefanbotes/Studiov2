

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getCoacheeProfile, storeCoacheeProfile, listCoacheeProfiles } from "@/lib/services/coachee-profiles"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const coacheeId = searchParams.get("coacheeId")

    if (coacheeId) {
      // Get specific coachee profile
      const profile = await getCoacheeProfile(coacheeId)
      return NextResponse.json({ profile })
    } else {
      // Get all profile IDs
      const profileIds = await listCoacheeProfiles()
      return NextResponse.json({ 
        profileIds,
        count: profileIds.length,
        message: "Current coachee profiles in the system"
      })
    }
  } catch (error) {
    console.error("Error in coachee-profiles API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { coacheeId, profile } = await request.json()

    if (!coacheeId || !profile) {
      return NextResponse.json({ error: "Missing coacheeId or profile" }, { status: 400 })
    }

    await storeCoacheeProfile(coacheeId, profile)

    return NextResponse.json({ 
      success: true, 
      message: `Profile stored for coachee ${coacheeId}`
    })
  } catch (error) {
    console.error("Error storing coachee profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

