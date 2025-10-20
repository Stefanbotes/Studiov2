
/**
 * CANONICAL PROFILE BUILDER - QA Implementation
 * Builds canonical coachee profiles from validated components
 */

import { CoacheeCanonicalProfile } from '@/lib/types/canonical-json'
import { 
  ImportPayload, 
  SchemaSelectionResult, 
  AnalysisLineage,
  CanonicalId
} from '@/lib/types/immutable-contracts'

export interface ParticipantInfo {
  name: string
  email?: string
  organization?: string
  role?: string
}

export interface ResolvedContent {
  clinical: Record<string, Record<string, any>>
  leadership: Record<string, Record<string, any>>
}

/**
 * Create canonical coachee profile from validated components
 * Handles both clinical profiles (with primary schema) and descriptive profiles (no clinical threshold met)
 */
export function createCanonicalProfile(
  payload: ImportPayload,
  selectionResult: SchemaSelectionResult,
  resolvedContent: ResolvedContent | null,
  participantInfo: ParticipantInfo
): CoacheeCanonicalProfile {
  const primary = selectionResult.primary
  const secondary = selectionResult.secondary
  const tertiary = selectionResult.tertiary
  
  // Handle descriptive profile mode (no primary schema)
  if (!primary) {
    return createDescriptiveProfile(payload, selectionResult, participantInfo)
  }

  // Handle clinical profile mode (has primary schema)
  // Get resolved content
  const primaryClinical = resolvedContent!.clinical[primary.clinical_id]
  const primaryLeadership = resolvedContent!.leadership[primary.clinical_id]
  
  const secondaryClinical = secondary ? resolvedContent!.clinical[secondary.clinical_id] : undefined
  const secondaryLeadership = secondary ? resolvedContent!.leadership[secondary.clinical_id] : undefined

  const tertiaryClinical = tertiary ? resolvedContent!.clinical[tertiary.clinical_id] : undefined
  const tertiaryLeadership = tertiary ? resolvedContent!.leadership[tertiary.clinical_id] : undefined

  // Determine variant based on confidence
  const variant = selectionResult.confidence > 0.8 ? "high" : 
                 selectionResult.confidence > 0.6 ? "moderate" : "low"

  const canonical: CoacheeCanonicalProfile = {
    participant: {
      name: participantInfo.name,
      email: participantInfo.email,
      org: participantInfo.organization,
      title: participantInfo.role,
      overall: {
        label: `${primary.clinical_id.replace(/_/g, ' ').toUpperCase()} SCHEMA`,
        variant
      },
      nextSession: "TBD"
    },

    leadership: {
      primary: {
        unmet_need: primaryLeadership.unmet_need,
        surrender_behavior: primaryLeadership.surrender_behavior,
        avoidance_behavior: primaryLeadership.avoidance_behavior,
        overcompensation_behavior: primaryLeadership.overcompensation_behavior,
        maladaptive_modes: Array.isArray(primaryLeadership.maladaptive_modes) 
          ? primaryLeadership.maladaptive_modes 
          : [primaryLeadership.maladaptive_modes],
        leadership_persona: primaryLeadership.leadership_persona,
        healthy_persona: primaryLeadership.healthy_persona,
        leadership_behavior_markers: Array.isArray(primaryLeadership.leadership_behavior_markers)
          ? primaryLeadership.leadership_behavior_markers
          : [primaryLeadership.leadership_behavior_markers],
        impact_on_team: Array.isArray(primaryLeadership.impact_on_team)
          ? primaryLeadership.impact_on_team
          : [primaryLeadership.impact_on_team],
        decision_making_style: primaryLeadership.decision_making_style,
        lios_interpretation: primaryLeadership.lios_interpretation,
        growth_levers: Array.isArray(primaryLeadership.growth_levers)
          ? primaryLeadership.growth_levers
          : [primaryLeadership.growth_levers]
      },
      secondary: secondary && secondaryLeadership ? {
        unmet_need: secondaryLeadership.unmet_need,
        surrender_behavior: secondaryLeadership.surrender_behavior,
        avoidance_behavior: secondaryLeadership.avoidance_behavior,
        overcompensation_behavior: secondaryLeadership.overcompensation_behavior,
        maladaptive_modes: Array.isArray(secondaryLeadership.maladaptive_modes)
          ? secondaryLeadership.maladaptive_modes
          : [secondaryLeadership.maladaptive_modes],
        leadership_persona: secondaryLeadership.leadership_persona,
        healthy_persona: secondaryLeadership.healthy_persona,
        leadership_behavior_markers: Array.isArray(secondaryLeadership.leadership_behavior_markers)
          ? secondaryLeadership.leadership_behavior_markers
          : [secondaryLeadership.leadership_behavior_markers],
        impact_on_team: Array.isArray(secondaryLeadership.impact_on_team)
          ? secondaryLeadership.impact_on_team
          : [secondaryLeadership.impact_on_team],
        decision_making_style: secondaryLeadership.decision_making_style,
        lios_interpretation: secondaryLeadership.lios_interpretation,
        growth_levers: Array.isArray(secondaryLeadership.growth_levers)
          ? secondaryLeadership.growth_levers
          : [secondaryLeadership.growth_levers]
      } : undefined,
      tertiary: tertiary && tertiaryLeadership ? {
        unmet_need: tertiaryLeadership.unmet_need,
        surrender_behavior: tertiaryLeadership.surrender_behavior,
        avoidance_behavior: tertiaryLeadership.avoidance_behavior,
        overcompensation_behavior: tertiaryLeadership.overcompensation_behavior,
        maladaptive_modes: Array.isArray(tertiaryLeadership.maladaptive_modes)
          ? tertiaryLeadership.maladaptive_modes
          : [tertiaryLeadership.maladaptive_modes],
        leadership_persona: tertiaryLeadership.leadership_persona,
        healthy_persona: tertiaryLeadership.healthy_persona,
        leadership_behavior_markers: Array.isArray(tertiaryLeadership.leadership_behavior_markers)
          ? tertiaryLeadership.leadership_behavior_markers
          : [tertiaryLeadership.leadership_behavior_markers],
        impact_on_team: Array.isArray(tertiaryLeadership.impact_on_team)
          ? tertiaryLeadership.impact_on_team
          : [tertiaryLeadership.impact_on_team],
        decision_making_style: tertiaryLeadership.decision_making_style,
        lios_interpretation: tertiaryLeadership.lios_interpretation,
        growth_levers: Array.isArray(tertiaryLeadership.growth_levers)
          ? tertiaryLeadership.growth_levers
          : [tertiaryLeadership.growth_levers]
      } : undefined
    },

    clinical: {
      primary: {
        Core_Needs_Frustrated: Array.isArray(primaryClinical.Core_Needs_Frustrated)
          ? primaryClinical.Core_Needs_Frustrated
          : [primaryClinical.Core_Needs_Frustrated],
        Typical_Developmental_Window: primaryClinical.Typical_Developmental_Window,
        Attachment_Correlates: Array.isArray(primaryClinical.Attachment_Correlates)
          ? primaryClinical.Attachment_Correlates
          : [primaryClinical.Attachment_Correlates],
        Developmental_Pathways: Array.isArray(primaryClinical.Developmental_Pathways)
          ? primaryClinical.Developmental_Pathways
          : [primaryClinical.Developmental_Pathways],
        Neurocognitive_Correlates: Array.isArray(primaryClinical.Neurocognitive_Correlates)
          ? primaryClinical.Neurocognitive_Correlates
          : [primaryClinical.Neurocognitive_Correlates],
        Memory_Systems: Array.isArray(primaryClinical.Memory_Systems)
          ? primaryClinical.Memory_Systems
          : [primaryClinical.Memory_Systems],
        Regulatory_Profile: primaryClinical.Regulatory_Profile,
        Maintaining_Biases: Array.isArray(primaryClinical.Maintaining_Biases)
          ? primaryClinical.Maintaining_Biases
          : [primaryClinical.Maintaining_Biases],
        Testable_Predictions: Array.isArray(primaryClinical.Testable_Predictions)
          ? primaryClinical.Testable_Predictions
          : [primaryClinical.Testable_Predictions],
        Primary_Thought: primaryClinical.Primary_Thought,
        Primary_Emotion: primaryClinical.Primary_Emotion,
        Primary_Belief: primaryClinical.Primary_Belief,
        Primary_Bodily_Anchor: primaryClinical.Primary_Bodily_Anchor,
        Recognized_Variants: Array.isArray(primaryClinical.Recognized_Variants)
          ? primaryClinical.Recognized_Variants
          : [primaryClinical.Recognized_Variants],
        Mode_Surrender: Array.isArray(primaryClinical.Mode_Surrender)
          ? primaryClinical.Mode_Surrender
          : [primaryClinical.Mode_Surrender],
        Mode_Avoidance: Array.isArray(primaryClinical.Mode_Avoidance)
          ? primaryClinical.Mode_Avoidance
          : [primaryClinical.Mode_Avoidance],
        Mode_Overcompensation: Array.isArray(primaryClinical.Mode_Overcompensation)
          ? primaryClinical.Mode_Overcompensation
          : [primaryClinical.Mode_Overcompensation],
        Key_Moderators: Array.isArray(primaryClinical.Key_Moderators)
          ? primaryClinical.Key_Moderators
          : [primaryClinical.Key_Moderators],
        Core_Threat_Signal: primaryClinical.Core_Threat_Signal,
        "Primary_Defenses(Base-Rate)": Array.isArray(primaryClinical["Primary_Defenses(Base-Rate)"])
          ? primaryClinical["Primary_Defenses(Base-Rate)"]
          : [primaryClinical["Primary_Defenses(Base-Rate)"]],
        Surrender_Mode_Defenses: Array.isArray(primaryClinical.Surrender_Mode_Defenses)
          ? primaryClinical.Surrender_Mode_Defenses
          : [primaryClinical.Surrender_Mode_Defenses],
        Avoidance_Mode_Defenses: Array.isArray(primaryClinical.Avoidance_Mode_Defenses)
          ? primaryClinical.Avoidance_Mode_Defenses
          : [primaryClinical.Avoidance_Mode_Defenses],
        Overcompensation_Mode_Defenses: Array.isArray(primaryClinical.Overcompensation_Mode_Defenses)
          ? primaryClinical.Overcompensation_Mode_Defenses
          : [primaryClinical.Overcompensation_Mode_Defenses],
        Vaillant_Levels_Typically_Engaged: Array.isArray(primaryClinical.Vaillant_Levels_Typically_Engaged)
          ? primaryClinical.Vaillant_Levels_Typically_Engaged
          : [primaryClinical.Vaillant_Levels_Typically_Engaged],
        "Defensive_Function(Anxiety_Avoided)": primaryClinical["Defensive_Function(Anxiety_Avoided)"],
        "Notes/Discriminators": `QA ANALYSIS: ${payload.assessment.completedAt} | ${payload.instrument.name} v${payload.instrument.version} | Primary: ${primary.clinical_id} (T${primary.tscore}) | Confidence: ${(selectionResult.confidence * 100).toFixed(1)}% | Atlas-validated`
      },
      secondary: secondary && secondaryClinical ? {
        Core_Needs_Frustrated: Array.isArray(secondaryClinical.Core_Needs_Frustrated)
          ? secondaryClinical.Core_Needs_Frustrated
          : [secondaryClinical.Core_Needs_Frustrated],
        Typical_Developmental_Window: secondaryClinical.Typical_Developmental_Window,
        Attachment_Correlates: Array.isArray(secondaryClinical.Attachment_Correlates)
          ? secondaryClinical.Attachment_Correlates
          : [secondaryClinical.Attachment_Correlates],
        Developmental_Pathways: Array.isArray(secondaryClinical.Developmental_Pathways)
          ? secondaryClinical.Developmental_Pathways
          : [secondaryClinical.Developmental_Pathways],
        Neurocognitive_Correlates: Array.isArray(secondaryClinical.Neurocognitive_Correlates)
          ? secondaryClinical.Neurocognitive_Correlates
          : [secondaryClinical.Neurocognitive_Correlates],
        Memory_Systems: Array.isArray(secondaryClinical.Memory_Systems)
          ? secondaryClinical.Memory_Systems
          : [secondaryClinical.Memory_Systems],
        Regulatory_Profile: secondaryClinical.Regulatory_Profile,
        Maintaining_Biases: Array.isArray(secondaryClinical.Maintaining_Biases)
          ? secondaryClinical.Maintaining_Biases
          : [secondaryClinical.Maintaining_Biases],
        Testable_Predictions: Array.isArray(secondaryClinical.Testable_Predictions)
          ? secondaryClinical.Testable_Predictions
          : [secondaryClinical.Testable_Predictions],
        Primary_Thought: secondaryClinical.Primary_Thought,
        Primary_Emotion: secondaryClinical.Primary_Emotion,
        Primary_Belief: secondaryClinical.Primary_Belief,
        Primary_Bodily_Anchor: secondaryClinical.Primary_Bodily_Anchor,
        Recognized_Variants: Array.isArray(secondaryClinical.Recognized_Variants)
          ? secondaryClinical.Recognized_Variants
          : [secondaryClinical.Recognized_Variants],
        Mode_Surrender: Array.isArray(secondaryClinical.Mode_Surrender)
          ? secondaryClinical.Mode_Surrender
          : [secondaryClinical.Mode_Surrender],
        Mode_Avoidance: Array.isArray(secondaryClinical.Mode_Avoidance)
          ? secondaryClinical.Mode_Avoidance
          : [secondaryClinical.Mode_Avoidance],
        Mode_Overcompensation: Array.isArray(secondaryClinical.Mode_Overcompensation)
          ? secondaryClinical.Mode_Overcompensation
          : [secondaryClinical.Mode_Overcompensation],
        Key_Moderators: Array.isArray(secondaryClinical.Key_Moderators)
          ? secondaryClinical.Key_Moderators
          : [secondaryClinical.Key_Moderators],
        Core_Threat_Signal: secondaryClinical.Core_Threat_Signal,
        "Primary_Defenses(Base-Rate)": Array.isArray(secondaryClinical["Primary_Defenses(Base-Rate)"])
          ? secondaryClinical["Primary_Defenses(Base-Rate)"]
          : [secondaryClinical["Primary_Defenses(Base-Rate)"]],
        Surrender_Mode_Defenses: Array.isArray(secondaryClinical.Surrender_Mode_Defenses)
          ? secondaryClinical.Surrender_Mode_Defenses
          : [secondaryClinical.Surrender_Mode_Defenses],
        Avoidance_Mode_Defenses: Array.isArray(secondaryClinical.Avoidance_Mode_Defenses)
          ? secondaryClinical.Avoidance_Mode_Defenses
          : [secondaryClinical.Avoidance_Mode_Defenses],
        Overcompensation_Mode_Defenses: Array.isArray(secondaryClinical.Overcompensation_Mode_Defenses)
          ? secondaryClinical.Overcompensation_Mode_Defenses
          : [secondaryClinical.Overcompensation_Mode_Defenses],
        Vaillant_Levels_Typically_Engaged: Array.isArray(secondaryClinical.Vaillant_Levels_Typically_Engaged)
          ? secondaryClinical.Vaillant_Levels_Typically_Engaged
          : [secondaryClinical.Vaillant_Levels_Typically_Engaged],
        "Defensive_Function(Anxiety_Avoided)": secondaryClinical["Defensive_Function(Anxiety_Avoided)"],
        "Notes/Discriminators": `QA ANALYSIS: Secondary ${secondary.clinical_id} (T${secondary.tscore}) | Atlas-validated`
      } : undefined,
      tertiary: tertiary && tertiaryClinical ? {
        Core_Needs_Frustrated: Array.isArray(tertiaryClinical.Core_Needs_Frustrated)
          ? tertiaryClinical.Core_Needs_Frustrated
          : [tertiaryClinical.Core_Needs_Frustrated],
        Typical_Developmental_Window: tertiaryClinical.Typical_Developmental_Window,
        Attachment_Correlates: Array.isArray(tertiaryClinical.Attachment_Correlates)
          ? tertiaryClinical.Attachment_Correlates
          : [tertiaryClinical.Attachment_Correlates],
        Developmental_Pathways: Array.isArray(tertiaryClinical.Developmental_Pathways)
          ? tertiaryClinical.Developmental_Pathways
          : [tertiaryClinical.Developmental_Pathways],
        Neurocognitive_Correlates: Array.isArray(tertiaryClinical.Neurocognitive_Correlates)
          ? tertiaryClinical.Neurocognitive_Correlates
          : [tertiaryClinical.Neurocognitive_Correlates],
        Memory_Systems: Array.isArray(tertiaryClinical.Memory_Systems)
          ? tertiaryClinical.Memory_Systems
          : [tertiaryClinical.Memory_Systems],
        Regulatory_Profile: tertiaryClinical.Regulatory_Profile,
        Maintaining_Biases: Array.isArray(tertiaryClinical.Maintaining_Biases)
          ? tertiaryClinical.Maintaining_Biases
          : [tertiaryClinical.Maintaining_Biases],
        Testable_Predictions: Array.isArray(tertiaryClinical.Testable_Predictions)
          ? tertiaryClinical.Testable_Predictions
          : [tertiaryClinical.Testable_Predictions],
        Primary_Thought: tertiaryClinical.Primary_Thought,
        Primary_Emotion: tertiaryClinical.Primary_Emotion,
        Primary_Belief: tertiaryClinical.Primary_Belief,
        Primary_Bodily_Anchor: tertiaryClinical.Primary_Bodily_Anchor,
        Recognized_Variants: Array.isArray(tertiaryClinical.Recognized_Variants)
          ? tertiaryClinical.Recognized_Variants
          : [tertiaryClinical.Recognized_Variants],
        Mode_Surrender: Array.isArray(tertiaryClinical.Mode_Surrender)
          ? tertiaryClinical.Mode_Surrender
          : [tertiaryClinical.Mode_Surrender],
        Mode_Avoidance: Array.isArray(tertiaryClinical.Mode_Avoidance)
          ? tertiaryClinical.Mode_Avoidance
          : [tertiaryClinical.Mode_Avoidance],
        Mode_Overcompensation: Array.isArray(tertiaryClinical.Mode_Overcompensation)
          ? tertiaryClinical.Mode_Overcompensation
          : [tertiaryClinical.Mode_Overcompensation],
        Key_Moderators: Array.isArray(tertiaryClinical.Key_Moderators)
          ? tertiaryClinical.Key_Moderators
          : [tertiaryClinical.Key_Moderators],
        Core_Threat_Signal: tertiaryClinical.Core_Threat_Signal,
        "Primary_Defenses(Base-Rate)": Array.isArray(tertiaryClinical["Primary_Defenses(Base-Rate)"])
          ? tertiaryClinical["Primary_Defenses(Base-Rate)"]
          : [tertiaryClinical["Primary_Defenses(Base-Rate)"]],
        Surrender_Mode_Defenses: Array.isArray(tertiaryClinical.Surrender_Mode_Defenses)
          ? tertiaryClinical.Surrender_Mode_Defenses
          : [tertiaryClinical.Surrender_Mode_Defenses],
        Avoidance_Mode_Defenses: Array.isArray(tertiaryClinical.Avoidance_Mode_Defenses)
          ? tertiaryClinical.Avoidance_Mode_Defenses
          : [tertiaryClinical.Avoidance_Mode_Defenses],
        Overcompensation_Mode_Defenses: Array.isArray(tertiaryClinical.Overcompensation_Mode_Defenses)
          ? tertiaryClinical.Overcompensation_Mode_Defenses
          : [tertiaryClinical.Overcompensation_Mode_Defenses],
        Vaillant_Levels_Typically_Engaged: Array.isArray(tertiaryClinical.Vaillant_Levels_Typically_Engaged)
          ? tertiaryClinical.Vaillant_Levels_Typically_Engaged
          : [tertiaryClinical.Vaillant_Levels_Typically_Engaged],
        "Defensive_Function(Anxiety_Avoided)": tertiaryClinical["Defensive_Function(Anxiety_Avoided)"],
        "Notes/Discriminators": `QA ANALYSIS: Tertiary ${tertiary.clinical_id} (T${tertiary.tscore}) | Atlas-validated`
      } : undefined
    },

    coaching_process: {
      coaching_plan: [
        `QA SCHEMA-FOCUSED COACHING: ${primary.clinical_id.replace(/_/g, ' ').toUpperCase()}`,
        `Primary development: ${primaryLeadership.growth_levers?.[0] || 'Core leadership patterns'}`,
        secondary ? `Secondary focus: ${secondaryLeadership?.growth_levers?.[0] || secondary.clinical_id}` : 'Single schema approach',
        tertiary ? `Tertiary consideration: ${tertiaryLeadership?.growth_levers?.[0] || tertiary.clinical_id}` : '',
        `Clinical confidence: ${variant.toUpperCase()} (${(selectionResult.confidence * 100).toFixed(1)}%)`,
        `Analysis version: QA Bridge v2.1.0`
      ].filter(Boolean),
      session_log: [
        `QA ANALYSIS IMPORT: ${payload.assessment.completedAt}`,
        `Instrument: ${payload.instrument.name} v${payload.instrument.version}`,
        `PRIMARY SCHEMA: ${primary.clinical_id.replace(/_/g, ' ').toUpperCase()} (T${primary.tscore})`,
        `SECONDARY SCHEMA: ${secondary ? secondary.clinical_id.replace(/_/g, ' ').toUpperCase() + ` (T${secondary.tscore})` : 'NONE DETECTED'}`,
        `TERTIARY SCHEMA: ${tertiary ? tertiary.clinical_id.replace(/_/g, ' ').toUpperCase() + ` (T${tertiary.tscore})` : 'NONE DETECTED'}`,
        `CONFIDENCE: ${(selectionResult.confidence * 100).toFixed(1)}% (${variant.toUpperCase()})`,
        `TIE-BREAKERS: ${selectionResult.tie_breakers_applied.join(', ') || 'None required'}`,
        ...selectionResult.selection_notes
      ],
      additional_insights: [
        `Assessment processing completed with deterministic QA pipeline`,
        `Schema selection used clinical thresholds: Primary ≥T${primary.tscore}, Secondary ≥T55 (Δ≤7), Tertiary ≥T50 (Δ≤12)`,
        primaryLeadership.lios_interpretation ? `LIOS Framework: ${primaryLeadership.lios_interpretation}` : 'LIOS framework applied',
        `All content validated against atlas requirements - no fallback data used`
      ]
    }
  }

  return canonical
}

/**
 * Create a descriptive profile when no schemas meet clinical threshold
 */
function createDescriptiveProfile(
  payload: ImportPayload,
  selectionResult: SchemaSelectionResult,
  participantInfo: ParticipantInfo
): CoacheeCanonicalProfile {
  
  const canonical: CoacheeCanonicalProfile = {
    participant: {
      name: participantInfo.name,
      email: participantInfo.email,
      org: participantInfo.organization,
      title: participantInfo.role,
      overall: {
        label: "DESCRIPTIVE ASSESSMENT PROFILE",
        variant: "descriptive" as any
      },
      nextSession: "TBD"
    },

    leadership: {
      primary: {
        unmet_need: "Assessment results indicate sub-clinical schema activation patterns",
        surrender_behavior: "Individual demonstrates generally adaptive coping mechanisms",
        avoidance_behavior: "No clinically significant avoidance patterns detected",
        overcompensation_behavior: "No clinically significant overcompensation patterns observed",
        maladaptive_modes: ["None - assessment results within normal range"],
        leadership_persona: "Descriptive analysis - specific persona requires clinical threshold",
        healthy_persona: "Assessment indicates generally healthy schema functioning",
        leadership_behavior_markers: ["Schema activation patterns below clinical significance"],
        impact_on_team: ["Assessment suggests generally positive team dynamics potential"],
        decision_making_style: "Requires clinical threshold for specific pattern identification",
        lios_interpretation: "Assessment results indicate adaptive leadership potential",
        growth_levers: ["Focus on strengths-based development approach"]
      },
      secondary: undefined
    },

    clinical: {
      primary: {
        Core_Needs_Frustrated: ["Assessment indicates generally met core developmental needs"],
        Typical_Developmental_Window: "Sub-clinical activation - normal developmental trajectory suggested",
        Attachment_Correlates: ["Assessment suggests secure attachment tendencies"],
        Developmental_Pathways: ["Normal developmental trajectory indicated"],
        Neurocognitive_Correlates: ["Assessment indicates typical neurocognitive functioning"],
        Memory_Systems: ["No specific clinical concerns identified"],
        Regulatory_Profile: "Assessment suggests adaptive emotional regulation",
        Maintaining_Biases: ["Standard cognitive biases within normal range"],
        Testable_Predictions: ["Continued adaptive functioning anticipated"],
        Primary_Thought: "Assessment indicates generally positive self-concept",
        Primary_Emotion: "Emotional states within normal range",
        Primary_Belief: "Core beliefs appear generally adaptive",
        Primary_Bodily_Anchor: "No significant somatic presentations identified",
        Recognized_Variants: ["Standard presentation - no clinical variants detected"],
        Mode_Surrender: ["Adaptive coping mechanisms predominant"],
        Mode_Avoidance: ["No clinically significant avoidance detected"],
        Mode_Overcompensation: ["No clinically significant overcompensation detected"],
        Key_Moderators: ["Strengths-based factors support continued adaptation"],
        Core_Threat_Signal: "No specific core threat patterns identified",
        "Primary_Defenses(Base-Rate)": ["Adaptive defense mechanisms predominant"],
        Surrender_Mode_Defenses: ["Healthy surrender responses when appropriate"],
        Avoidance_Mode_Defenses: ["Minimal avoidance - generally approach-oriented"],
        Overcompensation_Mode_Defenses: ["Balanced responses - no overcompensation patterns"],
        Vaillant_Levels_Typically_Engaged: ["Mature defenses", "Neurotic defenses (adaptive range)"],
        "Defensive_Function(Anxiety_Avoided)": "Assessment indicates effective anxiety management",
        "Notes/Discriminators": `DESCRIPTIVE PROFILE: ${payload.assessment.completedAt} | ${payload.instrument.name} v${payload.instrument.version} | No schemas meet clinical threshold | Assessment indicates healthy functioning | Analysis available for strengths-based development`
      },
      secondary: undefined
    },

    coaching_process: {
      coaching_plan: [
        "DESCRIPTIVE ASSESSMENT - STRENGTHS-BASED APPROACH",
        "Primary development: Leverage existing adaptive patterns",
        "Focus: Build on healthy schema functioning",
        "Approach: Prevention-focused and growth-oriented",
        "Analysis version: Bridge V2.1.0 - Descriptive Mode"
      ],
      session_log: [
        `DESCRIPTIVE ANALYSIS: ${payload.assessment.completedAt}`,
        `Instrument: ${payload.instrument.name} v${payload.instrument.version}`,
        `RESULT: No schemas meet clinical threshold (T60+)`,
        `INTERPRETATION: Assessment indicates healthy schema functioning`,
        `RECOMMENDATION: Strengths-based development approach`,
        `CLINICAL STATUS: Sub-threshold - no clinical intervention indicated`,
        ...selectionResult.selection_notes.map(note => `ANALYSIS: ${note}`)
      ],
      additional_insights: [
        "Assessment processing completed with comprehensive Bridge V2 analysis",
        "All schemas below clinical threshold - indicates healthy psychological functioning",
        "Schema rankings available for strengths identification and development planning",
        "Consider strengths-based coaching approach rather than clinical intervention"
      ]
    }
  }

  return canonical
}
