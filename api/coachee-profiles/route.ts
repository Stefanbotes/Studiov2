
// API endpoints for managing coachee canonical profiles

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { 
  storeCoacheeProfile, 
  getCoacheeProfile, 
  listCoacheeProfiles,
  deleteCoacheeProfile 
} from "@/lib/services/coachee-profiles"
import { CoacheeCanonicalProfile } from "@/lib/types/canonical-json"

export async function GET(request: NextRequest) {
  try {
    // Skip auth check for demo purposes - in production you'd want proper auth
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const coacheeId = searchParams.get("coacheeId")

    if (coacheeId) {
      // Get specific coachee profile
      const profile = await getCoacheeProfile(coacheeId)
      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }
      return NextResponse.json({ profile })
    } else {
      // List all coachee IDs with profiles
      const profileIds = await listCoacheeProfiles()
      return NextResponse.json({ profileIds })
    }
  } catch (error) {
    console.error("Error in coachee profiles API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Skip auth check for demo purposes
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { coacheeId, profile }: { coacheeId: string; profile: CoacheeCanonicalProfile } = await request.json()

    if (!coacheeId || !profile) {
      return NextResponse.json({ error: "Missing coacheeId or profile data" }, { status: 400 })
    }

    await storeCoacheeProfile(coacheeId, profile)

    return NextResponse.json({ 
      message: "Profile stored successfully",
      coacheeId 
    })
  } catch (error) {
    console.error("Error storing coachee profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Skip auth check for demo purposes

    const { coacheeId, profile }: { coacheeId: string; profile: CoacheeCanonicalProfile } = await request.json()

    if (!coacheeId || !profile) {
      return NextResponse.json({ error: "Missing coacheeId or profile data" }, { status: 400 })
    }

    // For now, PUT is the same as POST (overwrite)
    await storeCoacheeProfile(coacheeId, profile)

    return NextResponse.json({ 
      message: "Profile updated successfully",
      coacheeId 
    })
  } catch (error) {
    console.error("Error updating coachee profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Skip auth check for demo purposes

    const { searchParams } = new URL(request.url)
    const coacheeId = searchParams.get("coacheeId")

    if (!coacheeId) {
      return NextResponse.json({ error: "Missing coacheeId" }, { status: 400 })
    }

    await deleteCoacheeProfile(coacheeId)

    return NextResponse.json({ 
      message: "Profile deleted successfully",
      coacheeId 
    })
  } catch (error) {
    console.error("Error deleting coachee profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
