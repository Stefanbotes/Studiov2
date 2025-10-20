
import { NextRequest, NextResponse } from 'next/server'
import { loadConfigFromDir, scoreFromConfig, type ScoreInputs, type Gates } from '@/lib/mode-scorer'
import path from 'path'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

// Load configuration once on server startup
let configCache: ReturnType<typeof loadConfigFromDir> | null = null

function getConfig() {
  if (!configCache) {
    const dataDir = path.join(process.cwd(), 'data', 'mode_scoring')
    configCache = loadConfigFromDir(dataDir)
  }
  return configCache
}

/**
 * POST /api/mode-scorer
 * Calculate mode probabilities based on schema z-scores and context gates
 * 
 * Request body:
 * {
 *   z: Record<string, number>,  // Schema z-scores (standardized)
 *   gates?: {                   // Optional context gates (0-1)
 *     intimacy?: number,
 *     evaluation?: number,
 *     limits?: number,
 *     competition?: number,
 *     rule?: number
 *   }
 * }
 * 
 * Response:
 * {
 *   coping: {
 *     cS: number, cA: number, cO: number,
 *     raw: { S: number, A: number, O: number }
 *   },
 *   modes: Array<{
 *     mode: string,
 *     p: number,  // probability
 *     contrib: Array<{ clinical_id: string, score: number }>,
 *     copingLift: { S: number, A: number, O: number },
 *     gateLift: number
 *   }>,
 *   tau: number,
 *   entropy: number,
 *   top2Gap: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { z, gates } = body as { z?: Record<string, number>; gates?: Gates }

    // Validate input
    if (!z || typeof z !== 'object' || Object.keys(z).length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: "z" must be a non-empty object of schema z-scores' },
        { status: 400 }
      )
    }

    // Validate gates if provided
    if (gates) {
      const validGates = ['intimacy', 'evaluation', 'limits', 'competition', 'rule']
      for (const [key, value] of Object.entries(gates)) {
        if (!validGates.includes(key)) {
          return NextResponse.json(
            { error: `Invalid gate: "${key}". Valid gates are: ${validGates.join(', ')}` },
            { status: 400 }
          )
        }
        if (typeof value !== 'number' || value < 0 || value > 1) {
          return NextResponse.json(
            { error: `Gate "${key}" must be a number between 0 and 1` },
            { status: 400 }
          )
        }
      }
    }

    // Load configuration
    const { config, copingMap } = getConfig()

    // Create inputs
    const inputs: ScoreInputs = { z, gates: gates || {} }

    // Calculate mode scores
    const result = scoreFromConfig(inputs, config, copingMap)

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error calculating mode scores:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate mode scores',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mode-scorer
 * Returns information about available schemas and gates
 */
export async function GET() {
  try {
    const { config } = getConfig()

    const schemas = config.knownClinicalIds 
      ? Array.from(config.knownClinicalIds).sort()
      : []
    
    const modes = config.knownModeIds
      ? Array.from(config.knownModeIds).sort()
      : []

    return NextResponse.json({
      info: {
        schemas,
        modes,
        gates: ['intimacy', 'evaluation', 'limits', 'competition', 'rule'],
        schemaCount: schemas.length,
        modeCount: modes.length
      },
      usage: {
        endpoint: 'POST /api/mode-scorer',
        body: {
          z: 'Record<string, number> - Schema z-scores (required)',
          gates: 'Partial<Record<"intimacy"|"evaluation"|"limits"|"competition"|"rule", number>> - Context gates 0-1 (optional)'
        }
      }
    })

  } catch (error) {
    console.error('Error loading mode scorer info:', error)
    return NextResponse.json(
      { error: 'Failed to load mode scorer configuration' },
      { status: 500 }
    )
  }
}
