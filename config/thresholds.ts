
// Central configuration for all threshold-based visibility and content decisions
// This replaces scattered hardcoded values throughout the app

export const thresholds = {
  // Primary threshold for full clinical reliability
  active: 60,            // T-scores ≥60: full details, maximum confidence
  
  // Minimum threshold for emerging/subthreshold patterns  
  subthresholdMin: 50,   // T-scores 50-59: "emerging" exploratory band
  
  // UI behavior defaults
  secondaryCount: 2,     // always show at least top N schemas in Secondary tab
  coachToggleDefault: true, // show emerging patterns by default (true = exploratory)
  
  // Clinical significance bands (for advanced reporting)
  clinical: {
    veryHigh: 75,        // T≥75: very high clinical significance
    high: 65,            // T≥65: high clinical significance  
    moderate: 55,        // T≥55: moderate clinical significance
    low: 40,             // T≥40: low clinical significance
    // <40: very low clinical significance
  },
  
  // Tier labels for UI display
  tierRanges: {
    clinical: 70,        // T≥70: "Clinical Range"
    atRisk: 60,         // T≥60: "At-Risk Range" 
    moderate: 50,       // T≥50: "Moderate Range"
    // <50: "Low Range"
  }
}

// Type definitions for better TypeScript support
export type ThresholdConfig = typeof thresholds
export type ClinicalSignificance = 'very_high' | 'high' | 'moderate' | 'low' | 'very_low'
export type TierRange = 'clinical' | 'at_risk' | 'moderate' | 'low'
