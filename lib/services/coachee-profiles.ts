// Service for managing coachee canonical JSON profiles

import { CoacheeCanonicalProfile } from "@/lib/types/canonical-json"
import { promises as fs } from "fs"
import os from "os"
import * as path from "path"

// Writable temp dir (works on Vercel): /tmp/...
const TMP_DIR = path.join(os.tmpdir(), "coachee-profiles")

// Read-only bundled dir (your seed JSONs baked into the build): /var/task/coachee-profiles
const BUNDLE_DIR = path.join(process.cwd(), "coachee-profiles")

async function ensureTmpDir(): Promise<void> {
  try {
    await fs.mkdir(TMP_DIR, { recursive: true })
  } catch {
    // ignore mkdir races
  }
}

function tmpPath(coacheeId: string): string {
  return path.join(TMP_DIR, `${coacheeId}.json`)
}

function bundlePath(coacheeId: string): string {
  return path.join(BUNDLE_DIR, `${coacheeId}.json`)
}

/**
 * Store a coachee profile (write to writable /tmp)
 */
export async function storeCoacheeProfile(
  coacheeId: string,
  profile: CoacheeCanonicalProfile
): Promise<void> {
  await ensureTmpDir()
  const filePath = tmpPath(coacheeId)

  if (profile.analysis_lineage) {
    const schemaRankings = profile.analysis_lineage.schema_rankings
    console.log(
      `[STORAGE] ✅ Storing profile with analysis lineage for ${coacheeId} (schemas: ${schemaRankings?.length || 0})`
    )
  } else {
    console.warn(
      `[STORAGE] ⚠️ Storing profile WITHOUT analysis lineage for ${coacheeId}`
    )
  }

  await fs.writeFile(filePath, JSON.stringify(profile, null, 2), "utf-8")
  console.log(`[STORAGE] Stored coachee profile for ${coacheeId} at ${filePath}`)
}

/**
 * Retrieve a coachee profile by ID
 * 1) Prefer /tmp (latest writes)
 * 2) Fallback to bundled read-only seed
 */
export async function getCoacheeProfile(
  coacheeId: string
): Promise<CoacheeCanonicalProfile | null> {
  const tmp = tmpPath(coacheeId)
  const bundled = bundlePath(coacheeId)

  try {
    // Try tmp first
    await fs.access(tmp)
    const content = await fs.readFile(tmp, "utf-8")
    console.log(`Retrieved coachee profile (tmp) for ${coacheeId}`)
    return JSON.parse(content)
  } catch {
    // Fall back to bundled file
    try {
      await fs.access(bundled)
      const content = await fs.readFile(bundled, "utf-8")
      console.log(`Retrieved coachee profile (bundled) for ${coacheeId}`)
      return JSON.parse(content)
    } catch {
      return null
    }
  }
}

/**
 * List all coachee IDs with profiles (union of tmp + bundled)
 */
export async function listCoacheeProfiles(): Promise<string[]> {
  await ensureTmpDir()
  const listFrom = async (dir: string) => {
    try {
      const files = await fs.readdir(dir)
      return files.filter(f => f.endsWith(".json")).map(f => f.replace(".json", ""))
    } catch {
      return []
    }
  }

  const [tmpIds, bundledIds] = await Promise.all([
    listFrom(TMP_DIR),
    listFrom(BUNDLE_DIR),
  ])

  const unique = Array.from(new Set([...bundledIds, ...tmpIds]))
  console.log(`Found ${unique.length} coachee profiles`)
  return unique
}

/**
 * Check if a coachee has a profile (tmp or bundled)
 */
export async function hasCoacheeProfile(coacheeId: string): Promise<boolean> {
  const check = async (p: string) => {
    try {
      await fs.access(p)
      return true
    } catch {
      return false
    }
  }
  return (await check(tmpPath(coacheeId))) || (await check(bundlePath(coacheeId)))
}

/**
 * Delete a coachee profile (tmp only)
 * (Bundled profiles are read-only and cannot be deleted at runtime)
 */
export async function deleteCoacheeProfile(coacheeId: string): Promise<void> {
  try {
    const p = tmpPath(coacheeId)
    await fs.unlink(p)
    console.log(`Deleted coachee profile (tmp) for ${coacheeId}`)
  } catch (err: any) {
    // Ignore if it doesn't exist
    if (err?.code !== "ENOENT") {
      console.error(`Failed to delete profile for ${coacheeId}:`, err)
      throw err
    }
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
  const profile = await getCoacheeProfile(coacheeId)
  if (!profile) return

  // merge + write back to tmp
  ;(profile as any)[section] = { ...(profile as any)[section], ...data }
  await storeCoacheeProfile(coacheeId, profile)
  console.log(`Updated ${section as string} for coachee ${coacheeId}`)
}
