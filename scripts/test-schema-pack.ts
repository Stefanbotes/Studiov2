
import { getSchemaPackData, getSchemaById, getAvailableSchemaIds, getLeadershipWorkflowData, getClinicalWorkflowData } from '../lib/schema-pack'

async function testSchemaPack() {
  console.log('🧪 Testing Schema Pack System...')
  console.log('=' .repeat(50))
  
  // Test loading schema pack
  const pack = getSchemaPackData()
  if (!pack) {
    console.error('❌ Failed to load schema pack')
    return
  }
  
  console.log(`✅ Schema pack loaded successfully`)
  console.log(`📦 Version: ${pack.version}`)
  console.log(`📅 Generated: ${pack.generatedAt}`)
  console.log(`🔢 Schema Count: ${pack.schemaCount}`)
  console.log(`📄 Source Files: ${pack.sourceFiles.join(', ')}`)
  
  // Test available schema IDs
  const schemaIds = getAvailableSchemaIds()
  console.log(`\n🎯 Available Schema IDs (${schemaIds.length}):`)
  schemaIds.forEach(id => console.log(`  - ${id}`))
  
  // Test getting specific schema
  const testSchemaId = schemaIds[0] // Use first schema for testing
  console.log(`\n🔍 Testing schema: ${testSchemaId}`)
  
  const schema = getSchemaById(testSchemaId)
  if (schema) {
    console.log(`✅ Schema found`)
    console.log(`📊 Has leadership data: ${!!schema.leadership.primary}`)
    console.log(`📊 Has clinical data: ${!!schema.clinical.primary}`)
    console.log(`📅 Updated: ${schema.metadata.updated_at}`)
    console.log(`📄 Source files: ${schema.metadata.source_files.join(', ')}`)
  } else {
    console.error(`❌ Schema not found: ${testSchemaId}`)
    return
  }
  
  // Test leadership workflow data
  const leadershipData = getLeadershipWorkflowData(testSchemaId)
  if (leadershipData) {
    console.log(`\n💼 Leadership Workflow Data:`)
    console.log(`  Schema Name: ${leadershipData.schema_name_clinical || 'N/A'}`)
    console.log(`  Leadership Persona: ${leadershipData.leadership_persona || 'N/A'}`)
    console.log(`  Healthy Persona: ${leadershipData.healthy_persona || 'N/A'}`)
    console.log(`  Unmet Need: ${leadershipData.unmet_need || 'N/A'}`)
    console.log(`  Growth Levers: ${(leadershipData.growth_levers || '').substring(0, 100)}...`)
  } else {
    console.error(`❌ No leadership data for: ${testSchemaId}`)
  }
  
  // Test clinical workflow data
  const clinicalData = getClinicalWorkflowData(testSchemaId)
  if (clinicalData) {
    console.log(`\n🏥 Clinical Workflow Data:`)
    console.log(`  Schema Name: ${clinicalData.schema_name || 'N/A'}`)
    console.log(`  Schema Domain: ${clinicalData.schema_domain || 'N/A'}`)
    console.log(`  Core Needs: ${clinicalData.core_needs || 'N/A'}`)
    console.log(`  Dev Window: ${clinicalData.dev_window || 'N/A'}`)
    console.log(`  Primary Emotion: ${clinicalData.emotion || 'N/A'}`)
    console.log(`  Primary Belief: ${clinicalData.belief || 'N/A'}`)
    console.log(`  Core Threat: ${clinicalData.threat || 'N/A'}`)
    console.log(`  Memory Systems: ${(clinicalData.memory || '').substring(0, 60)}...`)
    console.log(`  Surrender Mode: ${(clinicalData.surrender_mode || '').substring(0, 60)}...`)
  } else {
    console.error(`❌ No clinical data for: ${testSchemaId}`)
  }
  
  console.log('\n✅ Schema pack test completed!')
}

testSchemaPack().catch(console.error)
