
// Canonical JSON structure for coachee profiles

import type { AnalysisLineage } from './immutable-contracts'

export interface CoacheeCanonicalProfile {
  participant: {
    name: string
    email?: string
    org?: string
    title?: string
    overall: {
      label: string
      variant: "low" | "moderate" | "high"
    }
    nextSession?: string
  }
  leadership: {
    primary?: LeadershipData
    secondary?: LeadershipData
    tertiary?: LeadershipData
  }
  clinical: {
    primary?: ClinicalData
    secondary?: ClinicalData
    tertiary?: ClinicalData
  }
  advanced_insights?: AdvancedInsights
  coaching_process?: CoachingProcess
  analysis_lineage?: AnalysisLineage
}

export interface LeadershipData {
  unmet_need?: string
  surrender_behavior?: string
  avoidance_behavior?: string
  overcompensation_behavior?: string
  maladaptive_modes?: string[]
  leadership_persona?: string
  healthy_persona?: string
  leadership_behavior_markers?: string[]
  impact_on_team?: string[]
  decision_making_style?: string
  lios_interpretation?: string
  growth_levers?: string[]
}

export interface ClinicalData {
  Core_Needs_Frustrated?: string[]
  Typical_Developmental_Window?: string
  Attachment_Correlates?: string[]
  Developmental_Pathways?: string[]
  Neurocognitive_Correlates?: string[]
  Memory_Systems?: string[]
  Regulatory_Profile?: string
  Maintaining_Biases?: string[]
  Testable_Predictions?: string[]
  Primary_Thought?: string
  Primary_Emotion?: string
  Primary_Belief?: string
  Primary_Bodily_Anchor?: string
  Recognized_Variants?: string[]
  Mode_Surrender?: string[]
  Mode_Avoidance?: string[]
  Mode_Overcompensation?: string[]
  Key_Moderators?: string[]
  Core_Threat_Signal?: string
  "Primary_Defenses(Base-Rate)"?: string[]
  Surrender_Mode_Defenses?: string[]
  Avoidance_Mode_Defenses?: string[]
  Overcompensation_Mode_Defenses?: string[]
  Vaillant_Levels_Typically_Engaged?: string[]
  "Defensive_Function(Anxiety_Avoided)"?: string
  "Notes/Discriminators"?: string
}

export interface AdvancedInsights {
  hypotheses?: string[]
  correlations?: string[]
  intervention_targets?: string[]
}

export interface CoachingProcess {
  coaching_plan?: string[]
  session_log?: string[]
  additional_insights?: string[]
}

// Display order constants
export const LEADERSHIP_KEY_ORDER: (keyof LeadershipData)[] = [
  "unmet_need",
  "surrender_behavior", 
  "avoidance_behavior",
  "overcompensation_behavior",
  "maladaptive_modes",
  "leadership_persona",
  "healthy_persona",
  "leadership_behavior_markers",
  "impact_on_team",
  "decision_making_style",
  "lios_interpretation",
  "growth_levers"
]

export const CLINICAL_KEY_ORDER: (keyof ClinicalData)[] = [
  "Core_Needs_Frustrated",
  "Typical_Developmental_Window",
  "Attachment_Correlates",
  "Developmental_Pathways",
  "Neurocognitive_Correlates",
  "Memory_Systems",
  "Regulatory_Profile",
  "Maintaining_Biases",
  "Testable_Predictions",
  "Primary_Thought",
  "Primary_Emotion",
  "Primary_Belief",
  "Primary_Bodily_Anchor",
  "Recognized_Variants",
  "Mode_Surrender",
  "Mode_Avoidance",
  "Mode_Overcompensation",
  "Key_Moderators",
  "Core_Threat_Signal",
  "Primary_Defenses(Base-Rate)",
  "Surrender_Mode_Defenses",
  "Avoidance_Mode_Defenses",
  "Overcompensation_Mode_Defenses",
  "Vaillant_Levels_Typically_Engaged",
  "Defensive_Function(Anxiety_Avoided)",
  "Notes/Discriminators"
]

// Utility type for persona selection
export type PersonaSide = "primary" | "secondary" | "tertiary"
