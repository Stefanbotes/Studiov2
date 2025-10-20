
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Load environment variables
config()

const prisma = new PrismaClient()

async function testCompleteWorkflow() {
  console.log('🚀 Starting complete workflow test...\n')
  
  try {
    // Step 1: Get the created user
    const user = await prisma.user.findFirst({
      where: { email: "test@psychologist.com" }
    })
    
    if (!user) {
      throw new Error("Test user not found")
    }
    
    console.log(`👤 Found user: ${user.name} (${user.email})`)
    console.log(`   Role: ${user.role}`)
    console.log(`   License: ${user.license}\n`)
    
    // Step 2: Create a client
    console.log('👥 Creating client...')
    const client = await prisma.clientProfile.create({
      data: {
        userId: user.id,
        firstName: "Emily",
        lastName: "Thompson",
        email: "emily.thompson@company.com",
        phone: "+1-555-0123",
        role: "VP Marketing",
        ageRange: "35-44",
        aspirations: "Seeking to enhance leadership skills and team dynamics",
        isActive: true
      }
    })
    
    console.log(`✅ Created client: ${client.firstName} ${client.lastName}`)
    console.log(`   ID: ${client.id}`)
    console.log(`   Email: ${client.email}`)
    console.log(`   Role: ${client.role}\n`)
    
    // Step 3: Create an engagement
    console.log('🤝 Creating engagement...')
    const engagement = await prisma.engagement.create({
      data: {
        clientId: client.id,
        phase: "INTAKE",
        description: "Executive coaching for leadership development"
      }
    })
    
    console.log(`✅ Created engagement: ${engagement.id}`)
    console.log(`   Phase: ${engagement.phase}\n`)
    
    // Step 4: Load and create assessment import (using the uploaded file)
    console.log('📋 Creating assessment import...')
    
    const assessmentData = {
      engagementId: engagement.id,
      clientId: client.id,
      respondentId: "cmfdxcam",
      assessmentId: "cmfe2ohf", 
      schemaVersion: "1.0.0",
      analysisVersion: "1.0.0",
      completedAt: new Date("2025-09-10T14:26:12Z"),
      objectKey: "test-assessment-key",
      checksumSha256: "abc123def456",
      status: "VALIDATED",
      metadata: {
        originalFileName: "client-cmfdxcam_assessment-cmfe2ohf_2025-09-10T14-26-12Z_v1.0.0.json",
        importedAt: new Date().toISOString()
      }
    }
    
    const assessmentImport = await prisma.assessmentImport.create({
      data: assessmentData
    })
    
    console.log(`✅ Created assessment import: ${assessmentImport.id}`)
    console.log(`   Respondent: ${assessmentImport.respondentId}`)
    console.log(`   Assessment: ${assessmentImport.assessmentId}`)
    console.log(`   Status: ${assessmentImport.status}\n`)
    
    // Step 5: Create computed result (simulating QA bridge process)
    console.log('📊 Creating computed result...')
    
    const computedResult = await prisma.computedResult.create({
      data: {
        assessmentImportId: assessmentImport.id,
        engineVersion: "2.0",
        mappingVersion: "1.0",
        schemaScoresJson: {
          "tier2_leader_explorer": 0.85,
          "tier2_leader_visionary": 0.72,
          "tier3_clinical_adaptive": 0.68
        },
        domainScoresJson: {
          "leadership": 0.78,
          "clinical": 0.65
        },
        modeScoresJson: {
          "primary": "tier2_leader_explorer",
          "secondary": "tier2_leader_visionary"
        },
        riskFlagsJson: {
          "burnout_risk": false,
          "leadership_stress": true
        }
      }
    })
    
    console.log(`✅ Created computed result: ${computedResult.id}`)
    console.log(`   Engine Version: ${computedResult.engineVersion}`)
    const modeScores = computedResult.modeScoresJson as any
    console.log(`   Primary Schema: ${modeScores?.primary}\n`)
    
    // Step 6: Create schema resolution (for Coaching Hub)
    console.log('🔗 Creating schema resolution...')
    
    // First, check if we have a schema pack
    let schemaPack = await prisma.schemaPackVersion.findFirst({
      where: { isActive: true }
    })
    
    if (!schemaPack) {
      console.log('📦 Creating default schema pack...')
      schemaPack = await prisma.schemaPackVersion.create({
        data: {
          version: "1.0.0",
          description: "Initial schema pack",
          schemaPackJson: {
            "tier2_leader_explorer": {
              "id": "tier2_leader_explorer",
              "name": "Leader Explorer",
              "tier": 2,
              "description": "Explores new possibilities and drives innovation"
            },
            "tier2_leader_visionary": {
              "id": "tier2_leader_visionary", 
              "name": "Leader Visionary",
              "tier": 2,
              "description": "Creates compelling visions for the future"
            }
          },
          buildHash: "test-hash-123",
          isActive: true
        }
      })
    }
    
    const schemaResolution = await prisma.schemaResolution.create({
      data: {
        clientId: client.id,
        schemaPackVersionId: schemaPack.id,
        primarySchemaId: "tier2_leader_explorer",
        secondarySchemaId: "tier2_leader_visionary",
        confidenceScore: 0.85,
        resolutionMethod: "ASSESSMENT_BASED"
      }
    })
    
    console.log(`✅ Created schema resolution: ${schemaResolution.id}`)
    console.log(`   Primary: ${schemaResolution.primarySchemaId}`)
    console.log(`   Secondary: ${schemaResolution.secondarySchemaId}`)
    console.log(`   Confidence: ${schemaResolution.confidenceScore}\n`)
    
    // Step 7: Create some coaching notes
    console.log('📝 Creating coaching notes...')
    
    const coachingNote = await prisma.coachingNote.create({
      data: {
        clientId: client.id,
        userId: user.id,
        engagementId: engagement.id,
        framework: "leadership",
        section: "unmet_need", 
        content: "Emily shows strong innovation drive but needs support in stakeholder communication",
        order: 1
      }
    })
    
    console.log(`✅ Created coaching note: ${coachingNote.id}`)
    console.log(`   Framework: ${coachingNote.framework}`)
    console.log(`   Section: ${coachingNote.section}\n`)
    
    // Final Summary
    console.log('🎉 WORKFLOW TEST COMPLETE!')
    console.log('=====================================')
    console.log(`✅ User: ${user.name}`)
    console.log(`✅ Client: ${client.firstName} ${client.lastName}`)
    console.log(`✅ Engagement: ${engagement.phase}`) 
    console.log(`✅ Assessment Import: ${assessmentImport.status}`)
    console.log(`✅ Computed Result: ${computedResult.engineVersion}`)
    console.log(`✅ Schema Resolution: ${schemaResolution.primarySchemaId}`)
    console.log(`✅ Coaching Note: ${coachingNote.framework}/${coachingNote.section}`)
    console.log('')
    console.log('🚀 Ready to test in UI!')
    console.log(`   Client ID: ${client.id}`)
    console.log(`   Engagement ID: ${engagement.id}`)
    console.log(`   Assessment Import ID: ${assessmentImport.id}`)
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the workflow test
testCompleteWorkflow()
  .then(() => {
    console.log('\n🎯 Workflow test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Workflow test failed:', error)
    process.exit(1)
  })
