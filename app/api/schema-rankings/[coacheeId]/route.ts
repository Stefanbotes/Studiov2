
// API endpoint for schema rankings (placeholder - data now comes from analysis lineage)

import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { coacheeId: string } }
) {
  return NextResponse.json({ 
    message: "Schema rankings now embedded in analysis lineage - use profile data instead",
    coacheeId: params.coacheeId 
  })
}
