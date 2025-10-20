
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface Mode {
  id: string
  name: string
  type: string
  linkedSchemas: string[]
  copingStrategy: string
  category: string
  isAdaptive?: boolean
}

export interface ModeLibrary {
  modes: Mode[]
  metadata: {
    version: string
    createdAt: string
    description: string
  }
}

let cachedModeLibrary: ModeLibrary | null = null

/**
 * Load and cache the mode library data
 */
export function getModeLibrary(): ModeLibrary | null {
  if (cachedModeLibrary) {
    return cachedModeLibrary
  }
  
  try {
    const modeLibraryPath = join(process.cwd(), 'data', 'modes.json')
    
    if (!existsSync(modeLibraryPath)) {
      console.warn('⚠️  Mode library not found.')
      return null
    }
    
    const content = readFileSync(modeLibraryPath, 'utf8')
    const data = JSON.parse(content) as ModeLibrary
    
    cachedModeLibrary = data
    return data
    
  } catch (error) {
    console.error('❌ Error loading mode library:', error)
    return null
  }
}

/**
 * Get mode data for a specific mode ID
 */
export function getModeById(modeId: string): Mode | null {
  const library = getModeLibrary()
  if (!library) return null
  
  return library.modes.find(mode => mode.id === modeId) || null
}

/**
 * Get all modes
 */
export function getAllModes(): Mode[] {
  const library = getModeLibrary()
  return library?.modes || []
}

/**
 * Get modes by category
 */
export function getModesByCategory(category: string): Mode[] {
  const library = getModeLibrary()
  if (!library) return []
  
  return library.modes.filter(mode => mode.category === category)
}

/**
 * Get modes linked to a specific schema
 */
export function getModesBySchema(schemaId: string): Mode[] {
  const library = getModeLibrary()
  if (!library) return []
  
  return library.modes.filter(mode => 
    mode.linkedSchemas.includes(schemaId)
  )
}

/**
 * Get mode categories
 */
export function getModeCategories(): string[] {
  const library = getModeLibrary()
  if (!library) return []
  
  return Array.from(new Set(library.modes.map(mode => mode.category)))
}

/**
 * Clear cache (useful for development)
 */
export function clearModeLibraryCache() {
  cachedModeLibrary = null
}
