
/**
 * Seed script to populate the Mode table from modes.json
 * Run: yarn tsx scripts/seed-modes.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { getModeLibrary } from '../lib/mode-library'

const prisma = new PrismaClient()

async function seedModes() {
  console.log('🌱 Seeding modes from mode library...')

  try {
    const library = getModeLibrary()
    if (!library) {
      console.error('❌ Could not load mode library')
      process.exit(1)
    }

    console.log(`📊 Found ${library.modes.length} modes to seed`)

    // Clear existing modes
    const deletedCount = await prisma.mode.deleteMany({})
    console.log(`🗑️  Cleared ${deletedCount.count} existing modes`)

    // Insert modes
    for (const mode of library.modes) {
      await prisma.mode.create({
        data: {
          modeId: mode.id,
          name: mode.name,
          type: mode.type,
          linkedSchemas: mode.linkedSchemas,
          copingStrategy: mode.copingStrategy,
          category: mode.category,
          isAdaptive: mode.isAdaptive || false
        }
      })
      console.log(`  ✓ Seeded: ${mode.name}`)
    }

    console.log('\n✅ Mode seeding completed successfully!')
    console.log(`📊 Total modes seeded: ${library.modes.length}`)

    // Print summary by category
    const categoryCounts: Record<string, number> = {}
    library.modes.forEach(mode => {
      categoryCounts[mode.category] = (categoryCounts[mode.category] || 0) + 1
    })

    console.log('\n📈 Breakdown by category:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`)
    })

  } catch (error) {
    console.error('❌ Error seeding modes:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedModes()
