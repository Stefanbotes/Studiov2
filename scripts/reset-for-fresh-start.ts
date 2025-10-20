
// Simple database reset script
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function resetDatabase() {
  console.log('🔄 Resetting database for fresh start...')
  
  try {
    console.log('1. Clearing all profile files...')
    await execAsync('rm -f /home/ubuntu/studio_2/coachee-profiles/*.json')
    
    console.log('2. Clearing uploads (keeping directory)...')
    await execAsync('find /home/ubuntu/studio_2/uploads -type f -name "*.json" -delete 2>/dev/null || true')
    
    console.log('3. Clearing Next.js cache...')
    await execAsync('rm -rf /home/ubuntu/studio_2/.next')
    
    console.log('4. Running database reset...')
    const { stdout: resetOutput, stderr: resetError } = await execAsync('cd /home/ubuntu/studio_2 && npx prisma migrate reset --force')
    if (resetError) {
      console.log('Reset output:', resetOutput)
      console.log('Reset warnings:', resetError)
    }
    
    console.log('5. Running fresh seed...')
    const { stdout: seedOutput, stderr: seedError } = await execAsync('cd /home/ubuntu/studio_2 && npx prisma db seed')
    if (seedError) {
      console.log('Seed output:', seedOutput)
      console.log('Seed warnings:', seedError)
    }
    
    console.log('✅ Database reset completed!')
    console.log('')
    console.log('🎉 You now have a fresh system with:')
    console.log('- Clean database with sample data')
    console.log('- No problematic assessments')
    console.log('- Test account: john@doe.com / johndoe123')
    console.log('')
    console.log('💡 Next steps:')
    console.log('1. Start the app: yarn dev')
    console.log('2. Login with test credentials')  
    console.log('3. Create the client "Laetitia Auma" first')
    console.log('4. Then upload and bridge her assessment')
    
  } catch (error) {
    console.error('❌ Reset failed:', error)
    
    // Fallback - at least clear files
    try {
      console.log('🔄 Attempting file cleanup fallback...')
      await execAsync('rm -f /home/ubuntu/studio_2/coachee-profiles/*.json')
      await execAsync('rm -rf /home/ubuntu/studio_2/.next')
      console.log('✅ File cleanup completed')
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError)
    }
  }
}

resetDatabase()
