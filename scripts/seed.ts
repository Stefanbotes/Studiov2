
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'Master Coach',
      license: 'Licensed Psychologist',
      organization: 'Studio 2'
    }
  })

  console.log('✅ Created test user:', testUser.email)

  // Create sample clients
  const client1 = await prisma.clientProfile.create({
    data: {
      userId: testUser.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      phone: '(555) 123-4567',
      role: 'Senior Manager',
      ageRange: '31-35',
      aspirations: 'Develop leadership skills for transition to Director role. Focus on team management and strategic thinking.',
      pseudonym: 'Client A',
      isActive: true
    }
  })

  const client2 = await prisma.clientProfile.create({
    data: {
      userId: testUser.id,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@startup.com',
      role: 'CEO',
      ageRange: '36-40',
      aspirations: 'Scale leadership capabilities for rapidly growing startup. Improve delegation and organizational culture.',
      isActive: true
    }
  })

  const client3 = await prisma.clientProfile.create({
    data: {
      userId: testUser.id,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@corp.com',
      phone: '(555) 987-6543',
      role: 'Director',
      ageRange: '41-45',
      aspirations: 'Strengthen emotional intelligence and cross-functional collaboration skills.',
      isActive: true
    }
  })

  console.log('✅ Created sample clients')

  // Create engagements for clients
  const engagement1 = await prisma.engagement.create({
    data: {
      clientId: client1.id,
      phase: 'ACTIVE',
      description: 'Leadership development program'
    }
  })

  const engagement2 = await prisma.engagement.create({
    data: {
      clientId: client2.id,
      phase: 'ACTIVE',
      description: 'Executive coaching for startup CEO'
    }
  })

  const engagement3 = await prisma.engagement.create({
    data: {
      clientId: client3.id,
      phase: 'INTAKE',
      description: 'Assessment and planning phase'
    }
  })

  console.log('✅ Created engagements')

  // Create sample assessment imports
  const assessment1 = await prisma.assessmentImport.create({
    data: {
      clientId: client1.id,
      engagementId: engagement1.id,
      respondentId: 'RESP_001_SJ',
      assessmentId: 'ASS_T1_2024001',
      schemaVersion: '1.0.0',
      analysisVersion: '1.0.0',
      completedAt: new Date('2024-08-15'),
      objectKey: 'assessments/client1/t1-assessment.json',
      checksumSha256: 'abc123def456...',
      status: 'VALIDATED',
      metadata: {
        fileName: 't1-sarah-johnson.json',
        fileSize: 15240,
        importedBy: testUser.id,
        importedAt: new Date().toISOString()
      }
    }
  })

  const assessment2 = await prisma.assessmentImport.create({
    data: {
      clientId: client2.id,
      engagementId: engagement2.id,
      respondentId: 'RESP_002_MC',
      assessmentId: 'ASS_T1_2024002',
      schemaVersion: '1.0.0',
      analysisVersion: '1.0.0',
      completedAt: new Date('2024-09-01'),
      objectKey: 'assessments/client2/t1-assessment.json',
      checksumSha256: 'def456ghi789...',
      status: 'VALIDATED',
      metadata: {
        fileName: 't1-michael-chen.json',
        fileSize: 18560,
        importedBy: testUser.id,
        importedAt: new Date().toISOString()
      }
    }
  })

  console.log('✅ Created sample assessments')

  // Create computed results
  await prisma.computedResult.create({
    data: {
      assessmentImportId: assessment1.id,
      engineVersion: '1.0.0',
      mappingVersion: '1.0.0',
      schemaScoresJson: {
        'leadership': 82,
        'communication': 75,
        'strategic_thinking': 68,
        'emotional_intelligence': 79
      },
      domainScoresJson: {
        'interpersonal': 77,
        'cognitive': 71,
        'behavioral': 83
      },
      modeScoresJson: {
        'directive': 85,
        'collaborative': 72,
        'supportive': 79
      },
      riskFlagsJson: {
        'stress_indicators': ['high_workload'],
        'development_areas': ['strategic_planning', 'delegation']
      }
    }
  })

  await prisma.computedResult.create({
    data: {
      assessmentImportId: assessment2.id,
      engineVersion: '1.0.0',
      mappingVersion: '1.0.0',
      schemaScoresJson: {
        'leadership': 88,
        'innovation': 92,
        'communication': 70,
        'strategic_thinking': 85
      },
      domainScoresJson: {
        'interpersonal': 73,
        'cognitive': 89,
        'behavioral': 81
      },
      modeScoresJson: {
        'directive': 92,
        'collaborative': 65,
        'supportive': 68
      },
      riskFlagsJson: {
        'stress_indicators': ['decision_fatigue', 'rapid_growth_pressure'],
        'development_areas': ['team_building', 'delegation']
      }
    }
  })

  console.log('✅ Created computed results')

  // Create mapping version
  await prisma.mappingVersion.create({
    data: {
      name: 'Standard Leadership Assessment',
      version: '1.0.0',
      tablesBlobKey: 'mappings/leadership-v1.json',
      description: 'Initial mapping for leadership assessments',
      isActive: true
    }
  })

  console.log('✅ Created mapping version')

  console.log('🎉 Database seed completed successfully!')
  console.log('\n📋 Test Account Credentials:')
  console.log('Email: john@doe.com')
  console.log('Password: johndoe123')
  console.log('Role: Master Coach')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
