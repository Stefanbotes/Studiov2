const fs = require('fs');
const path = require('path');

// Additional reflection statements for each schema (statements 4, 5, 6)
const additionalStatements = {
  "abandonment_instability": {
    "reflection_statement_4": "4) I need frequent reassurance from my team.",
    "reflection_statement_5": "5) I fear being replaced or forgotten.",
    "reflection_statement_6": "6) I struggle when people are unavailable."
  },
  "defectiveness_shame": {
    "reflection_statement_4": "4) I fear others will discover my weaknesses.",
    "reflection_statement_5": "5) I downplay my achievements.",
    "reflection_statement_6": "6) I feel fundamentally flawed."
  },
  "mistrust_abuse": {
    "reflection_statement_4": "4) I question people's true motives.",
    "reflection_statement_5": "5) I keep important information to myself.",
    "reflection_statement_6": "6) I expect to be taken advantage of."
  },
  "emotional_deprivation": {
    "reflection_statement_4": "4) I rarely expect emotional support.",
    "reflection_statement_5": "5) I feel unseen by others.",
    "reflection_statement_6": "6) I accept minimal emotional connection."
  },
  "social_isolation_alienation": {
    "reflection_statement_4": "4) I feel like an outsider in groups.",
    "reflection_statement_5": "5) I rarely share my true self.",
    "reflection_statement_6": "6) I believe I'm fundamentally different."
  },
  "failure": {
    "reflection_statement_4": "4) I avoid challenging opportunities.",
    "reflection_statement_5": "5) I expect to fall short.",
    "reflection_statement_6": "6) I compare myself unfavorably to others."
  },
  "dependence_incompetence": {
    "reflection_statement_4": "4) I seek excessive guidance from others.",
    "reflection_statement_5": "5) I doubt my judgment constantly.",
    "reflection_statement_6": "6) I feel helpless without support."
  },
  "vulnerability_to_harm_illness": {
    "reflection_statement_4": "4) I worry about worst-case scenarios.",
    "reflection_statement_5": "5) I avoid situations with uncertainty.",
    "reflection_statement_6": "6) I feel constantly at risk."
  },
  "enmeshment_undeveloped_self": {
    "reflection_statement_4": "4) I struggle to make independent decisions.",
    "reflection_statement_5": "5) I feel lost without close connections.",
    "reflection_statement_6": "6) I have difficulty defining my own goals."
  },
  "subjugation": {
    "reflection_statement_4": "4) I suppress my own needs regularly.",
    "reflection_statement_5": "5) I fear conflict and confrontation.",
    "reflection_statement_6": "6) I prioritize others' preferences over mine."
  },
  "self_sacrifice": {
    "reflection_statement_4": "4) I feel guilty when I prioritize myself.",
    "reflection_statement_5": "5) I overextend to help others.",
    "reflection_statement_6": "6) I neglect my own well-being."
  },
  "emotional_inhibition": {
    "reflection_statement_4": "4) I rarely express vulnerability.",
    "reflection_statement_5": "5) I keep my emotions tightly controlled.",
    "reflection_statement_6": "6) I fear losing control if I open up."
  },
  "unrelenting_standards_hypercriticalness": {
    "reflection_statement_4": "4) I'm never satisfied with my work.",
    "reflection_statement_5": "5) I criticize myself harshly for mistakes.",
    "reflection_statement_6": "6) I expect perfection from myself and others."
  },
  "entitlement_grandiosity": {
    "reflection_statement_4": "4) I deserve special treatment.",
    "reflection_statement_5": "5) I'm frustrated when I don't get recognition.",
    "reflection_statement_6": "6) I believe I'm superior to most people."
  },
  "insufficient_self_control_discipline": {
    "reflection_statement_4": "4) I struggle to follow through on commitments.",
    "reflection_statement_5": "5) I prioritize immediate gratification.",
    "reflection_statement_6": "6) I have difficulty with self-regulation."
  },
  "approval_seeking_recognition_seeking": {
    "reflection_statement_4": "4) I need constant validation from others.",
    "reflection_statement_5": "5) I shape myself to fit others' expectations.",
    "reflection_statement_6": "6) I feel empty without external praise."
  },
  "negativity_pessimism": {
    "reflection_statement_4": "4) I focus on what could go wrong.",
    "reflection_statement_5": "5) I expect disappointment regularly.",
    "reflection_statement_6": "6) I struggle to see positive possibilities."
  },
  "punitiveness": {
    "reflection_statement_4": "4) I believe people should be punished for mistakes.",
    "reflection_statement_5": "5) I'm intolerant of human imperfection.",
    "reflection_statement_6": "6) I hold grudges and resentments."
  }
};

// Read the schema pack
const schemaPackPath = path.join(__dirname, '../data/schema-pack.json');
const schemaPack = JSON.parse(fs.readFileSync(schemaPackPath, 'utf8'));

// Update each schema with additional reflection statements
let updatedCount = 0;
for (const schemaId in schemaPack.schemas) {
  if (schemaPack.schemas[schemaId].leadership && 
      schemaPack.schemas[schemaId].leadership.primary &&
      additionalStatements[schemaId]) {
    
    const leadership = schemaPack.schemas[schemaId].leadership.primary;
    const additional = additionalStatements[schemaId];
    
    // Add the new reflection statements
    leadership.reflection_statement_4 = additional.reflection_statement_4;
    leadership.reflection_statement_5 = additional.reflection_statement_5;
    leadership.reflection_statement_6 = additional.reflection_statement_6;
    
    updatedCount++;
    console.log(`✓ Updated ${schemaId} with 6 reflection statements`);
  }
}

// Update the metadata
schemaPack.version = `v${Date.now()}_6items`;
schemaPack.generatedAt = new Date().toISOString();

// Write the updated schema pack
fs.writeFileSync(schemaPackPath, JSON.stringify(schemaPack, null, 2));

console.log(`\n✅ Updated ${updatedCount} schemas with 6 reflection statements each`);
console.log(`Schema pack version: ${schemaPack.version}`);
