
// Utility to convert uploaded assessment JSON to canonical coachee profile format

import { CoacheeCanonicalProfile } from "@/lib/types/canonical-json"
import { analyzeSchemas, loadSchemaDataMappings, SchemaAnalysisResult } from "./schema-analyzer"

interface UploadedAssessment {
  respondent: {
    id: string
    initials: string
    dobYear?: number | null
  }
  assessment: {
    assessmentId: string
    completedAt: string
    instrument: {
      name: string
      form: string
      scale: {
        min: number
        max: number
      }
      items: Array<{
        id: string
        value: number
      }>
    }
  }
  schemaResolution?: {
    primarySchemaId: string
    secondarySchemaId?: string | null
    confidenceScore: number
    analysisNotes?: string
  }
}

/**
 * Convert uploaded assessment JSON to canonical coachee profile format
 */
export async function convertAssessmentToCanonical(
  assessment: UploadedAssessment,
  participantInfo: {
    name: string
    email?: string
    organization?: string
    role?: string
  }
): Promise<CoacheeCanonicalProfile> {
  
  // Analyze assessment data to determine schemas
  let schemaAnalysis: SchemaAnalysisResult
  
  if (assessment.schemaResolution) {
    // Use existing schema resolution
    schemaAnalysis = {
      primarySchemaId: assessment.schemaResolution.primarySchemaId,
      secondarySchemaId: assessment.schemaResolution.secondarySchemaId,
      confidenceScore: assessment.schemaResolution.confidenceScore,
      analysisNotes: assessment.schemaResolution.analysisNotes || 'Pre-analyzed schema resolution',
      itemScores: {},
      schemaScores: {},
      rawAnalysis: {
        totalItems: assessment.assessment.instrument.items.length,
        processedItems: assessment.assessment.instrument.items.length,
        averageResponse: assessment.assessment.instrument.items.reduce((sum, item) => sum + item.value, 0) / assessment.assessment.instrument.items.length,
        responseDistribution: assessment.assessment.instrument.items.reduce((dist, item) => {
          dist[item.value] = (dist[item.value] || 0) + 1
          return dist
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>),
        schemaActivationLevels: {}
      }
    }
  } else {
    // Analyze the assessment items to determine schemas
    schemaAnalysis = analyzeSchemas(assessment.assessment.instrument.items)
  }
  
  const primarySchema = schemaAnalysis.primarySchemaId
  const secondarySchema = schemaAnalysis.secondarySchemaId
  const confidenceScore = schemaAnalysis.confidenceScore
  const variant = confidenceScore > 0.8 ? "high" : confidenceScore > 0.4 ? "moderate" : "low"
  
  // Load actual schema data mappings
  const primaryMappings = await loadSchemaDataMappings(primarySchema)
  const secondaryMappings = secondarySchema ? await loadSchemaDataMappings(secondarySchema) : { leadership: {}, clinical: {} }
  
  console.log(`Converting assessment for ${participantInfo.name}:`)
  console.log(`- Primary Schema: ${primarySchema}`)
  console.log(`- Secondary Schema: ${secondarySchema}`)
  console.log(`- Confidence Score: ${confidenceScore}`)
  console.log(`- Variant: ${variant}`)
  
  // STRICT: Create canonical structure ONLY with actual atlas data - NO FALLBACKS
  if (!primaryMappings.leadership && !primaryMappings.clinical) {
    throw new Error(`STRICT CANONICAL FAILED: No atlas mappings available for primary schema "${primarySchema}"`)
  }

  console.log(`[STRICT] Building canonical profile with atlas data only`)
  console.log(`[STRICT] - Primary leadership fields: ${primaryMappings.leadership ? Object.keys(primaryMappings.leadership).length : 0}`)
  console.log(`[STRICT] - Primary clinical fields: ${primaryMappings.clinical ? Object.keys(primaryMappings.clinical).length : 0}`)

  const canonical: CoacheeCanonicalProfile = {
    participant: {
      name: participantInfo.name,
      email: participantInfo.email,
      org: participantInfo.organization,
      title: participantInfo.role,
      overall: {
        label: `${primarySchema.replace(/_/g, ' ').toUpperCase()} SCHEMA`,
        variant
      },
      nextSession: "TBD"
    },
    
    leadership: {
      primary: primaryMappings.leadership ? {
        unmet_need: primaryMappings.leadership.unmet_need,
        surrender_behavior: primaryMappings.leadership.surrender_behavior,
        avoidance_behavior: primaryMappings.leadership.avoidance_behavior,
        overcompensation_behavior: primaryMappings.leadership.overcompensation_behavior,
        maladaptive_modes: primaryMappings.leadership.maladaptive_modes,
        leadership_persona: primaryMappings.leadership.leadership_persona,
        healthy_persona: primaryMappings.leadership.healthy_persona,
        leadership_behavior_markers: primaryMappings.leadership.leadership_behavior_markers,
        impact_on_team: primaryMappings.leadership.impact_on_team,
        decision_making_style: primaryMappings.leadership.decision_making_style,
        lios_interpretation: primaryMappings.leadership.lios_interpretation,
        growth_levers: primaryMappings.leadership.growth_levers
      } : {
        unmet_need: `[ATLAS DATA REQUIRED] Primary leadership need for ${primarySchema}`,
        surrender_behavior: `[ATLAS DATA REQUIRED] Surrender behavior patterns`,
        avoidance_behavior: `[ATLAS DATA REQUIRED] Avoidance behavior patterns`,
        overcompensation_behavior: `[ATLAS DATA REQUIRED] Overcompensation behavior patterns`,
        maladaptive_modes: [`[ATLAS DATA REQUIRED] Maladaptive modes`],
        leadership_persona: `[ATLAS DATA REQUIRED] Leadership persona`,
        healthy_persona: `[ATLAS DATA REQUIRED] Healthy persona`,
        leadership_behavior_markers: [`[ATLAS DATA REQUIRED] Behavior markers`],
        impact_on_team: [`[ATLAS DATA REQUIRED] Team impact`],
        decision_making_style: `[ATLAS DATA REQUIRED] Decision style`,
        lios_interpretation: `[ATLAS DATA REQUIRED] LIOS interpretation`,
        growth_levers: [`[ATLAS DATA REQUIRED] Growth levers`]
      },
      secondary: (secondarySchema && secondaryMappings.leadership) ? {
        unmet_need: secondaryMappings.leadership.unmet_need,
        surrender_behavior: secondaryMappings.leadership.surrender_behavior,
        avoidance_behavior: secondaryMappings.leadership.avoidance_behavior,
        overcompensation_behavior: secondaryMappings.leadership.overcompensation_behavior,
        maladaptive_modes: secondaryMappings.leadership.maladaptive_modes,
        leadership_persona: secondaryMappings.leadership.leadership_persona,
        healthy_persona: secondaryMappings.leadership.healthy_persona,
        leadership_behavior_markers: secondaryMappings.leadership.leadership_behavior_markers,
        impact_on_team: secondaryMappings.leadership.impact_on_team,
        decision_making_style: secondaryMappings.leadership.decision_making_style,
        lios_interpretation: secondaryMappings.leadership.lios_interpretation,
        growth_levers: secondaryMappings.leadership.growth_levers
      } : undefined
    },
    
    clinical: {
      primary: primaryMappings.clinical ? {
        Core_Needs_Frustrated: primaryMappings.clinical.Core_Needs_Frustrated,
        Typical_Developmental_Window: primaryMappings.clinical.Typical_Developmental_Window,
        Attachment_Correlates: primaryMappings.clinical.Attachment_Correlates,
        Developmental_Pathways: primaryMappings.clinical.Developmental_Pathways,
        Neurocognitive_Correlates: primaryMappings.clinical.Neurocognitive_Correlates,
        Memory_Systems: primaryMappings.clinical.Memory_Systems,
        Regulatory_Profile: primaryMappings.clinical.Regulatory_Profile,
        Maintaining_Biases: primaryMappings.clinical.Maintaining_Biases,
        Testable_Predictions: primaryMappings.clinical.Testable_Predictions,
        Primary_Thought: primaryMappings.clinical.Primary_Thought,
        Primary_Emotion: primaryMappings.clinical.Primary_Emotion,
        Primary_Belief: primaryMappings.clinical.Primary_Belief,
        Primary_Bodily_Anchor: primaryMappings.clinical.Primary_Bodily_Anchor,
        Recognized_Variants: primaryMappings.clinical.Recognized_Variants,
        Mode_Surrender: primaryMappings.clinical.Mode_Surrender,
        Mode_Avoidance: primaryMappings.clinical.Mode_Avoidance,
        Mode_Overcompensation: primaryMappings.clinical.Mode_Overcompensation,
        Key_Moderators: primaryMappings.clinical.Key_Moderators,
        Core_Threat_Signal: primaryMappings.clinical.Core_Threat_Signal,
        "Primary_Defenses(Base-Rate)": primaryMappings.clinical["Primary_Defenses(Base-Rate)"],
        Surrender_Mode_Defenses: primaryMappings.clinical.Surrender_Mode_Defenses,
        Avoidance_Mode_Defenses: primaryMappings.clinical.Avoidance_Mode_Defenses,
        Overcompensation_Mode_Defenses: primaryMappings.clinical.Overcompensation_Mode_Defenses,
        Vaillant_Levels_Typically_Engaged: primaryMappings.clinical.Vaillant_Levels_Typically_Engaged,
        "Defensive_Function(Anxiety_Avoided)": primaryMappings.clinical["Defensive_Function(Anxiety_Avoided)"],
        "Notes/Discriminators": `STRICT ANALYSIS: ${assessment.assessment.completedAt} | ${assessment.assessment.instrument.name} | Primary: ${primarySchema} | Confidence: ${confidenceScore.toFixed(2)} | Source: Atlas Data`
      } : {
        Core_Needs_Frustrated: [`[ATLAS DATA REQUIRED] Core needs for ${primarySchema}`],
        Typical_Developmental_Window: `[ATLAS DATA REQUIRED] Developmental window`,
        Attachment_Correlates: [`[ATLAS DATA REQUIRED] Attachment correlates`],
        Developmental_Pathways: [`[ATLAS DATA REQUIRED] Developmental pathways`],
        Neurocognitive_Correlates: [`[ATLAS DATA REQUIRED] Neurocognitive correlates`],
        Memory_Systems: [`[ATLAS DATA REQUIRED] Memory systems`],
        Regulatory_Profile: `[ATLAS DATA REQUIRED] Regulatory profile`,
        Maintaining_Biases: [`[ATLAS DATA REQUIRED] Maintaining biases`],
        Testable_Predictions: [`[ATLAS DATA REQUIRED] Testable predictions`],
        Primary_Thought: `[ATLAS DATA REQUIRED] Primary thought patterns`,
        Primary_Emotion: `[ATLAS DATA REQUIRED] Primary emotional patterns`,
        Primary_Belief: `[ATLAS DATA REQUIRED] Primary belief systems`,
        Primary_Bodily_Anchor: `[ATLAS DATA REQUIRED] Primary bodily anchors`,
        Recognized_Variants: [`[ATLAS DATA REQUIRED] Recognized variants`],
        Mode_Surrender: [`[ATLAS DATA REQUIRED] Surrender mode characteristics`],
        Mode_Avoidance: [`[ATLAS DATA REQUIRED] Avoidance mode characteristics`],
        Mode_Overcompensation: [`[ATLAS DATA REQUIRED] Overcompensation mode characteristics`],
        Key_Moderators: [`[ATLAS DATA REQUIRED] Key moderators`],
        Core_Threat_Signal: `[ATLAS DATA REQUIRED] Core threat signals`,
        "Primary_Defenses(Base-Rate)": [`[ATLAS DATA REQUIRED] Primary defenses`],
        Surrender_Mode_Defenses: [`[ATLAS DATA REQUIRED] Surrender defenses`],
        Avoidance_Mode_Defenses: [`[ATLAS DATA REQUIRED] Avoidance defenses`],
        Overcompensation_Mode_Defenses: [`[ATLAS DATA REQUIRED] Overcompensation defenses`],
        Vaillant_Levels_Typically_Engaged: [`[ATLAS DATA REQUIRED] Vaillant levels`],
        "Defensive_Function(Anxiety_Avoided)": `[ATLAS DATA REQUIRED] Defensive function`,
        "Notes/Discriminators": `STRICT ANALYSIS: Atlas data required for ${primarySchema} | Assessment: ${assessment.assessment.completedAt}`
      },
      secondary: (secondarySchema && secondaryMappings.clinical) ? {
        Core_Needs_Frustrated: secondaryMappings.clinical.Core_Needs_Frustrated,
        Typical_Developmental_Window: secondaryMappings.clinical.Typical_Developmental_Window,
        Attachment_Correlates: secondaryMappings.clinical.Attachment_Correlates,
        Developmental_Pathways: secondaryMappings.clinical.Developmental_Pathways,
        Neurocognitive_Correlates: secondaryMappings.clinical.Neurocognitive_Correlates,
        Memory_Systems: secondaryMappings.clinical.Memory_Systems,
        Regulatory_Profile: secondaryMappings.clinical.Regulatory_Profile,
        Maintaining_Biases: secondaryMappings.clinical.Maintaining_Biases,
        Testable_Predictions: secondaryMappings.clinical.Testable_Predictions,
        Primary_Thought: secondaryMappings.clinical.Primary_Thought,
        Primary_Emotion: secondaryMappings.clinical.Primary_Emotion,
        Primary_Belief: secondaryMappings.clinical.Primary_Belief,
        Primary_Bodily_Anchor: secondaryMappings.clinical.Primary_Bodily_Anchor,
        Recognized_Variants: secondaryMappings.clinical.Recognized_Variants,
        Mode_Surrender: secondaryMappings.clinical.Mode_Surrender,
        Mode_Avoidance: secondaryMappings.clinical.Mode_Avoidance,
        Mode_Overcompensation: secondaryMappings.clinical.Mode_Overcompensation,
        Key_Moderators: secondaryMappings.clinical.Key_Moderators,
        Core_Threat_Signal: secondaryMappings.clinical.Core_Threat_Signal,
        "Primary_Defenses(Base-Rate)": secondaryMappings.clinical["Primary_Defenses(Base-Rate)"],
        Surrender_Mode_Defenses: secondaryMappings.clinical.Surrender_Mode_Defenses,
        Avoidance_Mode_Defenses: secondaryMappings.clinical.Avoidance_Mode_Defenses,
        Overcompensation_Mode_Defenses: secondaryMappings.clinical.Overcompensation_Mode_Defenses,
        Vaillant_Levels_Typically_Engaged: secondaryMappings.clinical.Vaillant_Levels_Typically_Engaged,
        "Defensive_Function(Anxiety_Avoided)": secondaryMappings.clinical["Defensive_Function(Anxiety_Avoided)"],
        "Notes/Discriminators": `STRICT ANALYSIS: Secondary ${secondarySchema} | Atlas-based analysis`
      } : undefined
    },
    
    coaching_process: {
      coaching_plan: [
        `STRICT SCHEMA-FOCUSED COACHING: ${primarySchema.replace(/_/g, ' ').toUpperCase()}`,
        primaryMappings.leadership?.growth_levers?.[0] ? `Primary focus: ${primaryMappings.leadership.growth_levers[0]}` : `[ATLAS DATA REQUIRED] Primary development focus`,
        secondarySchema && secondaryMappings.leadership?.growth_levers?.[0] ? `Secondary focus: ${secondaryMappings.leadership.growth_levers[0]}` : (secondarySchema ? `[ATLAS DATA REQUIRED] Secondary ${secondarySchema} development` : 'Single schema approach'),
        `Clinical confidence: ${variant.toUpperCase()} (${(confidenceScore * 100).toFixed(1)}%)`
      ],
      session_log: [
        `STRICT ANALYSIS IMPORT: ${assessment.assessment.completedAt}`,
        `LASBI Instrument: ${assessment.assessment.instrument.name} (${assessment.assessment.instrument.form} form)`,
        `PRIMARY SCHEMA: ${primarySchema.replace(/_/g, ' ').toUpperCase()} (Score: ${schemaAnalysis.schemaScores[primarySchema]?.toFixed(2) || 'N/A'})`,
        `SECONDARY SCHEMA: ${secondarySchema?.replace(/_/g, ' ').toUpperCase() || 'NONE DETECTED'} ${secondarySchema ? `(Score: ${schemaAnalysis.schemaScores[secondarySchema]?.toFixed(2) || 'N/A'})` : ''}`,
        `ANALYSIS CONFIDENCE: ${(confidenceScore * 100).toFixed(1)}% (${variant.toUpperCase()})`,
        `ATLAS DATA: ${primaryMappings.leadership ? 'LEADERSHIP ✓' : 'LEADERSHIP ✗'} | ${primaryMappings.clinical ? 'CLINICAL ✓' : 'CLINICAL ✗'}`
      ],
      additional_insights: [
        schemaAnalysis.analysisNotes,
        `Assessment Response Pattern: ${schemaAnalysis.rawAnalysis.averageResponse.toFixed(1)} average (${schemaAnalysis.rawAnalysis.processedItems}/${schemaAnalysis.rawAnalysis.totalItems} items processed)`,
        primaryMappings.leadership?.lios_interpretation ? `LIOS Framework: ${primaryMappings.leadership.lios_interpretation}` : `[ATLAS DATA REQUIRED] LIOS interpretation for ${primarySchema}`
      ]
    }
  }
  
  // Generate detailed insights based on actual assessment data
  const detailedInsights = generateDetailedInsights(
    assessment, 
    schemaAnalysis, 
    primaryMappings, 
    secondaryMappings, 
    primarySchema, 
    secondarySchema
  )
  
  // STRICT: Add advanced insights based on actual assessment analysis - NO FALLBACKS
  canonical.advanced_insights = {
    hypotheses: [
      schemaAnalysis.analysisNotes,
      `PRIMARY HYPOTHESIS: ${primarySchema.replace(/_/g, ' ').toUpperCase()} schema drives leadership patterns (Score: ${schemaAnalysis.schemaScores[primarySchema]?.toFixed(2) || 'N/A'})`,
      secondarySchema ? `SECONDARY HYPOTHESIS: ${secondarySchema.replace(/_/g, ' ').toUpperCase()} provides additional context (Score: ${schemaAnalysis.schemaScores[secondarySchema]?.toFixed(2) || 'N/A'})` : 'SINGLE SCHEMA DOMINANCE: No secondary schema reaches clinical threshold',
      `CONFIDENCE LEVEL: ${variant.toUpperCase()} certainty (${(confidenceScore * 100).toFixed(1)}%) in schema identification`,
      ...detailedInsights.hypotheses
    ],
    correlations: [
      `${primarySchema.replace(/_/g, ' ').toUpperCase()} patterns correlate with ${Object.keys(schemaAnalysis.itemScores).length} LASBI assessment responses`,
      `Item analysis reveals ${Object.values(schemaAnalysis.rawAnalysis.responseDistribution).reduce((acc, count, index) => acc + (index >= 3 ? count : 0), 0)} high-activation responses (4-5 range)`,
      secondarySchema ? `Secondary correlation: ${secondarySchema.replace(/_/g, ' ').toUpperCase()} patterns show moderate alignment` : 'No significant secondary correlations detected',
      ...detailedInsights.correlations
    ],
    intervention_targets: [
      primaryMappings.leadership?.growth_levers?.[0] ? `PRIMARY TARGET: ${primaryMappings.leadership.growth_levers[0]}` : `[ATLAS DATA REQUIRED] Primary intervention target for ${primarySchema}`,
      primaryMappings.leadership?.leadership_persona ? `LEADERSHIP FOCUS: ${primaryMappings.leadership.leadership_persona}` : `[ATLAS DATA REQUIRED] Leadership persona for ${primarySchema}`,
      primaryMappings.clinical?.Primary_Thought ? `CLINICAL FOCUS: ${primaryMappings.clinical.Primary_Thought}` : `[ATLAS DATA REQUIRED] Primary thought patterns for ${primarySchema}`,
      secondarySchema && secondaryMappings.leadership?.growth_levers?.[0] ? `SECONDARY TARGET: ${secondaryMappings.leadership.growth_levers[0]}` : (secondarySchema ? `[ATLAS DATA REQUIRED] Secondary ${secondarySchema} intervention` : 'SINGLE-SCHEMA INTERVENTION APPROACH'),
      ...detailedInsights.interventionTargets
    ]
  }
  
  console.log(`Canonical profile created with:`)
  console.log(`- Leadership sections: ${canonical.leadership.primary ? 'primary' : 'none'}${canonical.leadership.secondary ? ', secondary' : ''}`)
  console.log(`- Clinical sections: ${canonical.clinical.primary ? 'primary' : 'none'}${canonical.clinical.secondary ? ', secondary' : ''}`)
  console.log(`- Coaching process: ${canonical.coaching_process ? 'yes' : 'no'}`)
  console.log(`- Advanced insights: ${canonical.advanced_insights ? 'yes' : 'no'}`)
  
  return canonical
}

/**
 * Generate detailed insights based on actual assessment data
 */
function generateDetailedInsights(
  assessment: UploadedAssessment,
  schemaAnalysis: any,
  primaryMappings: any,
  secondaryMappings: any,
  primarySchema: string,
  secondarySchema?: string | null
): {
  hypotheses: string[]
  correlations: string[]
  interventionTargets: string[]
} {
  const items = assessment.assessment.instrument.items
  const itemScores = schemaAnalysis.itemScores || {}
  const schemaScores = schemaAnalysis.schemaScores || {}
  
  // Analyze response patterns
  const highResponses = items.filter(item => item.value >= 4)
  const lowResponses = items.filter(item => item.value <= 2)
  const moderateResponses = items.filter(item => item.value === 3)
  
  // Calculate response distribution
  const totalItems = items.length
  const highPercentage = Math.round((highResponses.length / totalItems) * 100)
  const lowPercentage = Math.round((lowResponses.length / totalItems) * 100)
  const moderatePercentage = Math.round((moderateResponses.length / totalItems) * 100)
  
  // Identify response patterns
  const responsePattern = highPercentage > 40 ? 'high-activation' : 
                         lowPercentage > 40 ? 'low-activation' : 
                         'mixed-activation'
  
  // Calculate average response
  const averageResponse = items.reduce((sum, item) => sum + item.value, 0) / items.length
  
  const hypotheses: string[] = []
  const correlations: string[] = []
  const interventionTargets: string[] = []
  
  // Generate response-based hypotheses
  if (responsePattern === 'high-activation') {
    hypotheses.push(
      `High activation pattern observed (${highPercentage}% high responses) suggests active schema engagement`,
      `Average response of ${averageResponse.toFixed(1)} indicates above-threshold schema activation`,
      `${primarySchema.replace(/_/g, ' ')} pattern shows active manifestation rather than dormant state`
    )
  } else if (responsePattern === 'low-activation') {
    hypotheses.push(
      `Low activation pattern observed (${lowPercentage}% low responses) suggests controlled or avoided schema engagement`,
      `Average response of ${averageResponse.toFixed(1)} may indicate defensive underreporting or genuine low activation`,
      `${primarySchema.replace(/_/g, ' ')} pattern may be more avoidant or overcompensated than directly expressed`
    )
  } else {
    hypotheses.push(
      `Mixed activation pattern (H:${highPercentage}%, M:${moderatePercentage}%, L:${lowPercentage}%) suggests complex schema presentation`,
      `Average response of ${averageResponse.toFixed(1)} indicates selective schema activation across different domains`,
      `${primarySchema.replace(/_/g, ' ')} pattern shows nuanced expression with both active and controlled elements`
    )
  }
  
  // Generate correlations based on item analysis
  correlations.push(
    `${highResponses.length} items scored 4-5 (strongly agree), indicating active schema markers`,
    `${lowResponses.length} items scored 1-2 (disagree), suggesting areas of schema non-activation`,
    `Response variance analysis shows ${responsePattern} pattern consistent with ${primarySchema.replace(/_/g, ' ')} presentation`
  )
  
  if (secondarySchema && schemaScores[secondarySchema]) {
    const primaryScore = schemaScores[primarySchema] || 0
    const secondaryScore = schemaScores[secondarySchema] || 0
    const scoreDifference = Math.abs(primaryScore - secondaryScore)
    
    if (scoreDifference < 0.5) {
      correlations.push(`Co-occurring schemas detected: ${primarySchema.replace(/_/g, ' ')} (${primaryScore.toFixed(2)}) and ${secondarySchema.replace(/_/g, ' ')} (${secondaryScore.toFixed(2)}) show similar activation levels`)
    } else {
      correlations.push(`Primary-secondary hierarchy: ${primarySchema.replace(/_/g, ' ')} (${primaryScore.toFixed(2)}) dominates over ${secondarySchema.replace(/_/g, ' ')} (${secondaryScore.toFixed(2)})`)
    }
  }
  
  // Generate intervention targets based on response patterns and atlas data
  if (responsePattern === 'high-activation') {
    interventionTargets.push(
      `Direct schema modification: Address active ${primarySchema.replace(/_/g, ' ')} patterns through targeted intervention`,
      `Emotion regulation: High activation suggests need for emotional containment strategies`,
      `Behavioral pattern interruption: Focus on breaking active maladaptive cycles`
    )
  } else if (responsePattern === 'low-activation') {
    interventionTargets.push(
      `Schema awareness building: Low scores may indicate limited insight into ${primarySchema.replace(/_/g, ' ')} patterns`,
      `Defensive pattern exploration: Investigate potential avoidance or overcompensation masking true activation`,
      `Gentle schema activation: Carefully increase awareness without overwhelming defenses`
    )
  } else {
    interventionTargets.push(
      `Differential intervention: Target high-activation items while supporting low-activation areas`,
      `Pattern integration: Help client understand mixed presentation of ${primarySchema.replace(/_/g, ' ')} schema`,
      `Selective focus: Prioritize intervention based on most activated schema elements`
    )
  }
  
  // Add specific targets from atlas data if available
  if (primaryMappings.clinical?.Testable_Predictions) {
    const predictions = Array.isArray(primaryMappings.clinical.Testable_Predictions) 
      ? primaryMappings.clinical.Testable_Predictions 
      : [primaryMappings.clinical.Testable_Predictions]
    
    interventionTargets.push(
      `Evidence-based focus: Assessment data supports clinical predictions: ${predictions.slice(0, 2).join(', ')}`
    )
  }
  
  if (primaryMappings.leadership?.impact_on_team) {
    const teamImpacts = Array.isArray(primaryMappings.leadership.impact_on_team) 
      ? primaryMappings.leadership.impact_on_team 
      : [primaryMappings.leadership.impact_on_team]
    
    interventionTargets.push(
      `Leadership coaching priority: Address team impact areas: ${teamImpacts.slice(0, 2).join(', ')}`
    )
  }
  
  return {
    hypotheses,
    correlations,
    interventionTargets
  }
}

/**
 * Extract participant info from uploaded assessment and database client record
 */
export function extractParticipantInfo(assessment: UploadedAssessment, clientRecord?: any): {
  name: string
  email?: string
  organization?: string
  role?: string
} {
  return {
    name: clientRecord?.firstName && clientRecord?.lastName 
      ? `${clientRecord.firstName} ${clientRecord.lastName}`
      : `Participant ${assessment.respondent.initials}`,
    email: clientRecord?.email || undefined,
    organization: clientRecord?.user?.organization || undefined,
    role: clientRecord?.role || undefined
  }
}
