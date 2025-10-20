
import { NextResponse } from 'next/server'
import { getModeLibrary, getModeById, getModesBySchema, getModesByCategory } from '@/lib/mode-library'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

/**
 * GET /api/modes
 * Returns all modes or filtered modes based on query parameters
 * 
 * Query parameters:
 * - id: Get a specific mode by ID
 * - schemaId: Get modes linked to a specific schema
 * - category: Get modes by category (child_modes, coping_modes, parent_modes, adaptive_modes)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const modeId = searchParams.get('id')
    const schemaId = searchParams.get('schemaId')
    const category = searchParams.get('category')

    // Get specific mode by ID
    if (modeId) {
      const mode = getModeById(modeId)
      if (!mode) {
        return NextResponse.json(
          { error: 'Mode not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(mode)
    }

    // Get modes by schema
    if (schemaId) {
      const modes = getModesBySchema(schemaId)
      return NextResponse.json({
        schemaId,
        modes,
        count: modes.length
      })
    }

    // Get modes by category
    if (category) {
      const modes = getModesByCategory(category)
      return NextResponse.json({
        category,
        modes,
        count: modes.length
      })
    }

    // Get all modes
    const library = getModeLibrary()
    if (!library) {
      return NextResponse.json(
        { error: 'Mode library not available' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      modes: library.modes,
      metadata: library.metadata,
      count: library.modes.length
    })

  } catch (error) {
    console.error('Error fetching modes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modes' },
      { status: 500 }
    )
  }
}
