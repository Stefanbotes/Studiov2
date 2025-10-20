
/**
 * Test script to verify Reference Profile alignment
 * Tests the schema analyzer against the known reference data
 */

import { analyzeSchemas } from '../lib/utils/schema-analyzer'

// Reference test data that should produce Punitiveness (5.4) as primary at 4.00 (100%)
const TEST_ASSESSMENT_DATA = [
  // Punitiveness (5.4) items - should average 4.0
  { id: '5.4.R1', value: 4 },
  { id: '5.4.R2', value: 4 },
  { id: '5.4.R3', value: 4 },
  
  // Emotional Inhibition (5.2) items - should average 2.33
  { id: '5.2.R1', value: 2 },
  { id: '5.2.R2', value: 3 },
  { id: '5.2.R3', value: 2 },
  
  // Abandonment (1.1) items - should average 3.33
  { id: '1.1.R1', value: 3 },
  { id: '1.1.R2', value: 4 },
  { id: '1.1.R3', value: 3 },
  
  // Dependence (2.1) items - should average 2.33
  { id: '2.1.R1', value: 2 },
  { id: '2.1.R2', value: 3 },
  { id: '2.1.R3', value: 2 },
  
  // Additional items to simulate full assessment
  { id: '1.2.R1', value: 2 }, { id: '1.2.R2', value: 2 }, { id: '1.2.R3', value: 3 },
  { id: '1.3.R1', value: 3 }, { id: '1.3.R2', value: 3 }, { id: '1.3.R3', value: 2 },
  { id: '1.4.R1', value: 2 }, { id: '1.4.R2', value: 2 }, { id: '1.4.R3', value: 2 },
  { id: '1.5.R1', value: 2 }, { id: '1.5.R2', value: 2 }, { id: '1.5.R3', value: 2 },
  { id: '2.2.R1', value: 2 }, { id: '2.2.R2', value: 3 }, { id: '2.2.R3', value: 2 },
  { id: '2.3.R1', value: 2 }, { id: '2.3.R2', value: 1 }, { id: '2.3.R3', value: 2 },
  { id: '2.4.R1', value: 2 }, { id: '2.4.R2', value: 1 }, { id: '2.4.R3', value: 2 },
  { id: '3.1.R1', value: 3 }, { id: '3.1.R2', value: 3 }, { id: '3.1.R3', value: 2 },
  { id: '3.2.R1', value: 3 }, { id: '3.2.R2', value: 4 }, { id: '3.2.R3', value: 3 },
  { id: '4.1.R1', value: 3 }, { id: '4.1.R2', value: 3 }, { id: '4.1.R3', value: 2 },
  { id: '4.2.R1', value: 3 }, { id: '4.2.R2', value: 3 }, { id: '4.2.R3', value: 2 },
  { id: '4.3.R1', value: 3 }, { id: '4.3.R2', value: 4 }, { id: '4.3.R3', value: 3 },
  { id: '5.1.R1', value: 3 }, { id: '5.1.R2', value: 3 }, { id: '5.1.R3', value: 3 },
  { id: '5.3.R1', value: 3 }, { id: '5.3.R2', value: 3 }, { id: '5.3.R3', value: 2 }
]

async function testReferenceAlignment() {
  console.log('=== REFERENCE PROFILE ALIGNMENT TEST ===')
  console.log(`Testing ${TEST_ASSESSMENT_DATA.length} assessment items`)
  
  // Log expected results based on reference profile
  console.log('\n--- EXPECTED RESULTS (from reference profile) ---')
  console.log('Primary: Punitiveness (5.4) at 4.00 (100%)')
  console.log('Secondary: None (no schema meets 55% threshold within 7 points)')
  console.log('Scale: 1-4 observed')
  console.log('Emotional Inhibition: 2.33 (44.44%) - rank 14')
  console.log('Dependence/Incompetence: 2.33 (44.44%) - rank 12')
  
  try {
    // Run the schema analysis
    const result = analyzeSchemas(TEST_ASSESSMENT_DATA)
    
    console.log('\n--- ACTUAL RESULTS (from schema analyzer) ---')
    console.log(`Primary: ${result.primarySchemaId}`)
    console.log(`Secondary: ${result.secondarySchemaId || 'None'}`)
    console.log(`Confidence: ${(result.confidenceScore * 100).toFixed(1)}%`)
    console.log(`Analysis: ${result.analysisNotes}`)
    
    console.log('\n--- DETAILED SCHEMA SCORES ---')
    Object.entries(result.schemaScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .forEach(([schema, score], index) => {
        const percentage = calculatePercentage(score as number, 1, 4)
        console.log(`${index + 1}. ${schema}: ${(score as number).toFixed(2)} (${percentage}%)`)
      })
    
    console.log('\n--- RAW ANALYSIS ---')
    console.log(`Total items: ${result.rawAnalysis.totalItems}`)
    console.log(`Processed items: ${result.rawAnalysis.processedItems}`)
    console.log(`Average response: ${result.rawAnalysis.averageResponse.toFixed(2)}`)
    console.log(`Response distribution:`, result.rawAnalysis.responseDistribution)
    
    // Validate against reference expectations
    console.log('\n--- VALIDATION ---')
    const isPunitivenessCorrect = result.primarySchemaId === 'punitiveness'
    const isSecondaryCorrect = !result.secondarySchemaId
    
    console.log(`✓ Primary is Punitiveness: ${isPunitivenessCorrect ? 'PASS' : 'FAIL'}`)
    console.log(`✓ No secondary schema: ${isSecondaryCorrect ? 'PASS' : 'FAIL'}`)
    
    if (result.schemaScores['punitiveness']) {
      const punitivenessScore = result.schemaScores['punitiveness'] as number
      const expectedScore = 4.0
      const scoreMatch = Math.abs(punitivenessScore - expectedScore) < 0.1
      console.log(`✓ Punitiveness score ~4.0: ${scoreMatch ? 'PASS' : 'FAIL'} (got ${punitivenessScore.toFixed(2)})`)
    }
    
    if (result.schemaScores['emotional_inhibition']) {
      const emotionalScore = result.schemaScores['emotional_inhibition'] as number
      const expectedScore = 2.33
      const scoreMatch = Math.abs(emotionalScore - expectedScore) < 0.1
      console.log(`✓ Emotional Inhibition score ~2.33: ${scoreMatch ? 'PASS' : 'FAIL'} (got ${emotionalScore.toFixed(2)})`)
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error)
  }
}

function calculatePercentage(score: number, min: number, max: number): string {
  const percentage = ((score - min) / (max - min)) * 100
  return percentage.toFixed(1)
}

// Run the test
testReferenceAlignment().catch(console.error)
