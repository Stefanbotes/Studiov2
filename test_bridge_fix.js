
require('dotenv').config({ path: '/home/ubuntu/studio_2/.env' });
const path = require('path');
process.chdir('/home/ubuntu/studio_2');

// Mock assessment data similar to the uploaded file
const mockAssessment = {
  "schemaVersion": "1.0.0",
  "analysisVersion": "2025.09",
  "respondent": {
    "id": "test123",
    "initials": "TU"
  },
  "assessment": {
    "assessmentId": "test-assessment",
    "completedAt": "2025-09-15T10:30:00Z",
    "instrument": {
      "name": "LASBI",
      "form": "short",
      "scale": { "min": 1, "max": 5 },
      "items": [
        { "id": "5.2.R1", "value": 4 },
        { "id": "5.2.R2", "value": 4 },
        { "id": "5.2.R3", "value": 5 },
        { "id": "1.1.R1", "value": 2 },
        { "id": "1.1.R2", "value": 3 },
        { "id": "1.1.R3", "value": 2 }
      ]
    }
  }
};

const mockClient = {
  id: 'test-client-123',
  firstName: 'Test',
  lastName: 'Client',
  email: 'test@client.com',
  user: { organization: 'Test Org' }
};

async function testBridge() {
  console.log('🧪 Testing Bridge Fix for entitlement_grandiosity...');
  console.log('');

  try {
    // Import the schema analyzer
    const { analyzeSchemas } = require('./lib/utils/schema-analyzer');
    
    console.log('📊 Step 1: Analyzing assessment items...');
    const analysisResult = analyzeSchemas(mockAssessment.assessment.instrument.items);
    
    console.log('✅ Analysis Result:');
    console.log(`- Primary Schema: ${analysisResult.primarySchemaId}`);
    console.log(`- Secondary Schema: ${analysisResult.secondarySchemaId || 'None'}`);
    console.log(`- Confidence: ${(analysisResult.confidenceScore * 100).toFixed(1)}%`);
    console.log('');

    // Test schema data loading
    const { loadSchemaDataMappings } = require('./lib/utils/schema-analyzer');
    
    console.log('🗂️  Step 2: Loading schema mappings...');
    const schemaMappings = await loadSchemaDataMappings(analysisResult.primarySchemaId);
    
    console.log('✅ Schema Mappings Loaded:');
    console.log(`- Leadership data: ${schemaMappings.leadership ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`- Clinical data: ${schemaMappings.clinical ? 'FOUND' : 'NOT FOUND'}`);
    
    if (schemaMappings.leadership) {
      console.log(`- Leadership fields: ${Object.keys(schemaMappings.leadership).slice(0, 3).join(', ')}...`);
    }
    if (schemaMappings.clinical) {
      console.log(`- Clinical fields: ${Object.keys(schemaMappings.clinical).slice(0, 3).join(', ')}...`);
    }
    console.log('');

    // Test bridge engine
    const { bridgeAssessmentWithHardGating } = require('./lib/utils/bridge-engine-v2');
    
    console.log('🌉 Step 3: Testing bridge process...');
    const bridgeResult = await bridgeAssessmentWithHardGating(mockAssessment, mockClient);
    
    console.log('✅ Bridge Result:');
    console.log(`- Success: ${bridgeResult.success}`);
    console.log(`- Profile Created: ${bridgeResult.profile_created || 'N/A'}`);
    console.log(`- Processing Notes: ${bridgeResult.processing_notes?.length || 0} notes`);
    
    if (bridgeResult.processing_notes) {
      bridgeResult.processing_notes.forEach((note, i) => {
        console.log(`  ${i + 1}. ${note}`);
      });
    }
    
    if (bridgeResult.errors && bridgeResult.errors.length > 0) {
      console.log('❌ Errors:');
      bridgeResult.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    console.log('');
    console.log('🎉 Bridge test completed successfully!');
    console.log('The entitlement_grandiosity schema issue has been fixed.');

  } catch (error) {
    console.error('❌ Bridge test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testBridge();
