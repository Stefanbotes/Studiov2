
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

async function cleanAllClients() {
  console.log('🧹 Starting client cleanup...')
  
  try {
    await prisma.$transaction(async (tx: any) => {
      // Delete in correct order to respect foreign key constraints
      
      // Delete coaching sessions first
      const coachingSessionsCount = await tx.coachingSession.count()
      console.log(`📅 Deleting ${coachingSessionsCount} coaching sessions...`)
      await tx.coachingSession.deleteMany({})
      
      // Delete coaching notes
      const coachingNotesCount = await tx.coachingNote.count()
      console.log(`📝 Deleting ${coachingNotesCount} coaching notes...`)
      await tx.coachingNote.deleteMany({})
      
      // Delete schema resolutions
      const schemaResolutionsCount = await tx.schemaResolution.count()
      console.log(`🔗 Deleting ${schemaResolutionsCount} schema resolutions...`)
      await tx.schemaResolution.deleteMany({})
      
      // Delete computed results (linked to assessment imports)
      const computedResultsCount = await tx.computedResult.count()
      console.log(`📊 Deleting ${computedResultsCount} computed results...`)
      await tx.computedResult.deleteMany({})
      
      // Delete assessment imports
      const assessmentImportsCount = await tx.assessmentImport.count()
      console.log(`📋 Deleting ${assessmentImportsCount} assessment imports...`)
      await tx.assessmentImport.deleteMany({})
      
      // Delete session notes
      const sessionNotesCount = await tx.sessionNote.count()
      console.log(`📄 Deleting ${sessionNotesCount} session notes...`)
      await tx.sessionNote.deleteMany({})
      
      // Delete plan items
      const planItemsCount = await tx.planItem.count()
      console.log(`✅ Deleting ${planItemsCount} plan items...`)
      await tx.planItem.deleteMany({})
      
      // Delete plans
      const plansCount = await tx.plan.count()
      console.log(`📋 Deleting ${plansCount} plans...`)
      await tx.plan.deleteMany({})
      
      // Delete audit events (that might reference engagements/clients)
      const auditEventsCount = await tx.auditEvent.count()
      console.log(`📜 Deleting ${auditEventsCount} audit events...`)
      await tx.auditEvent.deleteMany({})
      
      // Delete engagements
      const engagementsCount = await tx.engagement.count()
      console.log(`🤝 Deleting ${engagementsCount} engagements...`)
      await tx.engagement.deleteMany({})
      
      // Finally, delete client profiles
      const clientProfilesCount = await tx.clientProfile.count()
      console.log(`👥 Deleting ${clientProfilesCount} client profiles...`)
      await tx.clientProfile.deleteMany({})
      
      console.log('✅ All client data has been successfully cleaned!')
      console.log('')
      console.log('📊 Summary:')
      console.log(`   • Client Profiles: ${clientProfilesCount}`)
      console.log(`   • Engagements: ${engagementsCount}`)
      console.log(`   • Assessment Imports: ${assessmentImportsCount}`)
      console.log(`   • Computed Results: ${computedResultsCount}`)
      console.log(`   • Schema Resolutions: ${schemaResolutionsCount}`)
      console.log(`   • Coaching Notes: ${coachingNotesCount}`)
      console.log(`   • Coaching Sessions: ${coachingSessionsCount}`)
      console.log(`   • Session Notes: ${sessionNotesCount}`)
      console.log(`   • Plans: ${plansCount}`)
      console.log(`   • Plan Items: ${planItemsCount}`)
      console.log(`   • Audit Events: ${auditEventsCount}`)
    })
    
  } catch (error) {
    console.error('❌ Error during client cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanAllClients()
  .then(() => {
    console.log('\n🎉 Client cleanup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Client cleanup failed:', error)
    process.exit(1)
  })
