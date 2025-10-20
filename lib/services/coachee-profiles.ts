
// Service for managing coachee canonical JSON profiles

import { CoacheeCanonicalProfile } from "@/lib/types/canonical-json"
import * as fs from "fs"
import * as path from "path"

// File-based storage directory
const PROFILES_DIR = path.join(process.cwd(), "coachee-profiles")

// Ensure profiles directory exists
function ensureProfilesDir(): void {
  if (!fs.existsSync(PROFILES_DIR)) {
    fs.mkdirSync(PROFILES_DIR, { recursive: true })
  }
}

// Get file path for a coachee profile
function getProfilePath(coacheeId: string): string {
  return path.join(PROFILES_DIR, `${coacheeId}.json`)
}

/**
 * Store a coachee profile
 */
export async function storeCoacheeProfile(
  coacheeId: string, 
  profile: CoacheeCanonicalProfile
): Promise<void> {
  try {
    ensureProfilesDir()
    const filePath = getProfilePath(coacheeId)
    
    // Debug: Check if analysis lineage is present
    if (profile.analysis_lineage) {
      console.log(`[STORAGE] ✅ Storing profile with analysis lineage for ${coacheeId}`)
      const schemaRankings = profile.analysis_lineage.schema_rankings
      console.log(`[STORAGE] 🔬 Lineage includes ${schemaRankings?.length || 0} schema rankings`)
      if (schemaRankings && schemaRankings.length > 0) {
        const topSchema = schemaRankings[0]
        console.log(`[STORAGE] 📊 Top schema: ${topSchema.schemaId} (T${topSchema.tscore}, rank ${topSchema.rank})`)
      }
    } else {
      console.warn(`[STORAGE] ⚠️ Storing profile WITHOUT analysis lineage for ${coacheeId} - Schema Rankings will not work`)
    }
    
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8')
    console.log(`[STORAGE] Stored coachee profile for ${coacheeId} at ${filePath}`)
  } catch (error) {
    console.error(`Failed to store profile for ${coacheeId}:`, error)
    throw error
  }
}

/**
 * Retrieve a coachee profile by ID
 */
export async function getCoacheeProfile(
  coacheeId: string
): Promise<CoacheeCanonicalProfile | null> {
  try {
    const filePath = getProfilePath(coacheeId)
    if (!fs.existsSync(filePath)) {
      return null
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const profile = JSON.parse(fileContent)
    console.log(`Retrieved coachee profile for ${coacheeId} from ${filePath}`)
    return profile
  } catch (error) {
    console.error(`Failed to retrieve profile for ${coacheeId}:`, error)
    return null
  }
}

/**
 * List all coachee IDs with profiles
 */
export async function listCoacheeProfiles(): Promise<string[]> {
  try {
    ensureProfilesDir()
    const files = fs.readdirSync(PROFILES_DIR)
    const profileIds = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
    console.log(`Found ${profileIds.length} coachee profiles: ${profileIds.join(', ')}`)
    return profileIds
  } catch (error) {
    console.error("Failed to list coachee profiles:", error)
    return []
  }
}

/**
 * Check if a coachee has a profile
 */
export async function hasCoacheeProfile(coacheeId: string): Promise<boolean> {
  try {
    const filePath = getProfilePath(coacheeId)
    return fs.existsSync(filePath)
  } catch (error) {
    console.error(`Failed to check profile for ${coacheeId}:`, error)
    return false
  }
}

/**
 * Delete a coachee profile
 */
export async function deleteCoacheeProfile(coacheeId: string): Promise<void> {
  try {
    const filePath = getProfilePath(coacheeId)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Deleted coachee profile for ${coacheeId}`)
    }
  } catch (error) {
    console.error(`Failed to delete profile for ${coacheeId}:`, error)
    throw error
  }
}

/**
 * Update specific section of a coachee profile
 */
export async function updateProfileSection(
  coacheeId: string,
  section: keyof CoacheeCanonicalProfile,
  data: any
): Promise<void> {
  try {
    const profile = await getCoacheeProfile(coacheeId)
    if (profile) {
      profile[section] = { ...profile[section], ...data }
      await storeCoacheeProfile(coacheeId, profile)
      console.log(`Updated ${section} for coachee ${coacheeId}`)
    }
  } catch (error) {
    console.error(`Failed to update profile section for ${coacheeId}:`, error)
    throw error
  }
}
