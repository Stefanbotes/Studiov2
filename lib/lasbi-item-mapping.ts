
/**
 * LASBI Item ID to Variable ID Mapping
 * Maps modern LASBI complex item IDs to canonical variable IDs for Bridge V2 processing
 */

interface LASBIItemMapping {
  itemId: string
  variableId: string
  questionNumber: number
  schemaLabel: string
}

// Based on typical LASBI structure with 51 items mapping to 18 schemas
// Each schema has 2-4 questions, distributed across the 51 items
export const LASBI_ITEM_MAPPINGS: LASBIItemMapping[] = [
  // Section 1: Disconnection & Rejection (1.1 - 1.5) - 15 items
  // 1.1 Abandonment/Instability (3 items)
  { itemId: "cmff2ushm0000sbb3xz75fwkz", variableId: "1.1", questionNumber: 1, schemaLabel: "Abandonment" },
  { itemId: "cmff2ushp0001sbb3pndmp2so", variableId: "1.1", questionNumber: 2, schemaLabel: "Abandonment" },
  { itemId: "cmff2ushq0002sbb32tnxfwlh", variableId: "1.1", questionNumber: 3, schemaLabel: "Abandonment" },
  
  // 1.2 Defectiveness/Shame (3 items)
  { itemId: "cmff2ushr0003sbb3flyzk52v", variableId: "1.2", questionNumber: 1, schemaLabel: "Defectiveness/Shame" },
  { itemId: "cmff2usht0004sbb3ffbtcrz1", variableId: "1.2", questionNumber: 2, schemaLabel: "Defectiveness/Shame" },
  { itemId: "cmff2ushu0005sbb3sg7x6xou", variableId: "1.2", questionNumber: 3, schemaLabel: "Defectiveness/Shame" },
  
  // 1.3 Emotional Deprivation (3 items)
  { itemId: "cmff2ushv0006sbb3o6qo5u3p", variableId: "1.3", questionNumber: 1, schemaLabel: "Emotional Deprivation" },
  { itemId: "cmff2ushx0007sbb343uaq7c3", variableId: "1.3", questionNumber: 2, schemaLabel: "Emotional Deprivation" },
  { itemId: "cmff2ushy0008sbb3o690p5jb", variableId: "1.3", questionNumber: 3, schemaLabel: "Emotional Deprivation" },
  
  // 1.4 Mistrust/Abuse (3 items)
  { itemId: "cmff2ushz0009sbb3kpmyd2vv", variableId: "1.4", questionNumber: 1, schemaLabel: "Mistrust/Abuse" },
  { itemId: "cmff2usi1000asbb3g2b2rrbg", variableId: "1.4", questionNumber: 2, schemaLabel: "Mistrust/Abuse" },
  { itemId: "cmff2usi2000bsbb38ksh1592", variableId: "1.4", questionNumber: 3, schemaLabel: "Mistrust/Abuse" },
  
  // 1.5 Social Isolation (3 items)
  { itemId: "cmff2usi3000csbb3kvmjjlqx", variableId: "1.5", questionNumber: 1, schemaLabel: "Social Isolation" },
  { itemId: "cmff2usi4000dsbb3cd5wlepc", variableId: "1.5", questionNumber: 2, schemaLabel: "Social Isolation" },
  { itemId: "cmff2usi5000esbb3ylvjxwkg", variableId: "1.5", questionNumber: 3, schemaLabel: "Social Isolation" },
  
  // Section 2: Impaired Autonomy & Performance (2.1 - 2.4) - 12 items
  // 2.1 Dependence/Incompetence (3 items)
  { itemId: "cmff2usi7000fsbb3ywkt6zp7", variableId: "2.1", questionNumber: 1, schemaLabel: "Dependence/Incompetence" },
  { itemId: "cmff2usi8000gsbb3a09v5bws", variableId: "2.1", questionNumber: 2, schemaLabel: "Dependence/Incompetence" },
  { itemId: "cmff2usi9000hsbb3azlj0bkv", variableId: "2.1", questionNumber: 3, schemaLabel: "Dependence/Incompetence" },
  
  // 2.2 Vulnerability to Harm (3 items)
  { itemId: "cmff2usib000isbb3c7s52ubh", variableId: "2.2", questionNumber: 1, schemaLabel: "Vulnerability to Harm" },
  { itemId: "cmff2usic000jsbb3rs3bs16v", variableId: "2.2", questionNumber: 2, schemaLabel: "Vulnerability to Harm" },
  { itemId: "cmff2usid000ksbb3i2jyy5oj", variableId: "2.2", questionNumber: 3, schemaLabel: "Vulnerability to Harm" },
  
  // 2.3 Enmeshment/Undeveloped Self (3 items)
  { itemId: "cmff2usie000lsbb3euvd2b7y", variableId: "2.3", questionNumber: 1, schemaLabel: "Enmeshment/Undeveloped Self" },
  { itemId: "cmff2usif000msbb3v6yu4bd0", variableId: "2.3", questionNumber: 2, schemaLabel: "Enmeshment/Undeveloped Self" },
  { itemId: "cmff2usih000nsbb3c5rnpxfd", variableId: "2.3", questionNumber: 3, schemaLabel: "Enmeshment/Undeveloped Self" },
  
  // 2.4 Failure (3 items)
  { itemId: "cmff2usii000osbb3lmntidwh", variableId: "2.4", questionNumber: 1, schemaLabel: "Failure" },
  { itemId: "cmff2usij000psbb3ny55yrs2", variableId: "2.4", questionNumber: 2, schemaLabel: "Failure" },
  { itemId: "cmff2usik000qsbb3iuypzlgo", variableId: "2.4", questionNumber: 3, schemaLabel: "Failure" },
  
  // Section 3: Impaired Limits (3.1 - 3.2) - 6 items
  // 3.1 Entitlement/Grandiosity (3 items)
  { itemId: "cmff2usil000rsbb3dr1qqw4h", variableId: "3.1", questionNumber: 1, schemaLabel: "Entitlement/Grandiosity" },
  { itemId: "cmff2usin000ssbb3ahr8x8p1", variableId: "3.1", questionNumber: 2, schemaLabel: "Entitlement/Grandiosity" },
  { itemId: "cmff2usio000tsbb3tbvbwh4s", variableId: "3.1", questionNumber: 3, schemaLabel: "Entitlement/Grandiosity" },
  
  // 3.2 Insufficient Self-Control (3 items)
  { itemId: "cmff2usip000usbb39ky60h0y", variableId: "3.2", questionNumber: 1, schemaLabel: "Insufficient Self-Control" },
  { itemId: "cmff2usiq000vsbb3c8yb73sj", variableId: "3.2", questionNumber: 2, schemaLabel: "Insufficient Self-Control" },
  { itemId: "cmff2usir000wsbb3qg5zscpd", variableId: "3.2", questionNumber: 3, schemaLabel: "Insufficient Self-Control" },
  
  // Section 4: Other-Directedness (4.1 - 4.3) - 9 items
  // 4.1 Subjugation (3 items)
  { itemId: "cmff2usit000xsbb3swkgowx8", variableId: "4.1", questionNumber: 1, schemaLabel: "Subjugation" },
  { itemId: "cmff2usiu000ysbb3v302gutd", variableId: "4.1", questionNumber: 2, schemaLabel: "Subjugation" },
  { itemId: "cmff2usiv000zsbb3a6l4t6i2", variableId: "4.1", questionNumber: 3, schemaLabel: "Subjugation" },
  
  // 4.2 Self-Sacrifice (3 items)
  { itemId: "cmff2usix0010sbb3tmc3fibw", variableId: "4.2", questionNumber: 1, schemaLabel: "Self-Sacrifice" },
  { itemId: "cmff2usiy0011sbb3i0rwfy7i", variableId: "4.2", questionNumber: 2, schemaLabel: "Self-Sacrifice" },
  { itemId: "cmff2usiz0012sbb36w0dxezg", variableId: "4.2", questionNumber: 3, schemaLabel: "Self-Sacrifice" },
  
  // 4.3 Approval-Seeking (3 items)
  { itemId: "cmff2usj00013sbb3f2qfypqi", variableId: "4.3", questionNumber: 1, schemaLabel: "Approval-Seeking" },
  { itemId: "cmff2usj20014sbb3x0nvy9n4", variableId: "4.3", questionNumber: 2, schemaLabel: "Approval-Seeking" },
  { itemId: "cmff2usj30015sbb3132vwvuq", variableId: "4.3", questionNumber: 3, schemaLabel: "Approval-Seeking" },
  
  // Section 5: Overvigilance & Inhibition (5.1 - 5.4) - 12 items
  // 5.1 Negativity/Pessimism (3 items)
  { itemId: "cmff2usj40016sbb39ekru832", variableId: "5.1", questionNumber: 1, schemaLabel: "Negativity/Pessimism" },
  { itemId: "cmff2usj50017sbb3dwf4gj9i", variableId: "5.1", questionNumber: 2, schemaLabel: "Negativity/Pessimism" },
  { itemId: "cmff2usj60018sbb34db4vsk6", variableId: "5.1", questionNumber: 3, schemaLabel: "Negativity/Pessimism" },
  
  // 5.2 Emotional Inhibition (3 items)
  { itemId: "cmff2usj80019sbb3hoe1jieo", variableId: "5.2", questionNumber: 1, schemaLabel: "Emotional Inhibition" },
  { itemId: "cmff2usj9001asbb3vccgx7en", variableId: "5.2", questionNumber: 2, schemaLabel: "Emotional Inhibition" },
  { itemId: "cmff2usja001bsbb3j97bp80c", variableId: "5.2", questionNumber: 3, schemaLabel: "Emotional Inhibition" },
  
  // 5.3 Unrelenting Standards (3 items)
  { itemId: "cmff2usjb001csbb31c8pl4lv", variableId: "5.3", questionNumber: 1, schemaLabel: "Unrelenting Standards" },
  { itemId: "cmff2usjd001dsbb3se57nmbu", variableId: "5.3", questionNumber: 2, schemaLabel: "Unrelenting Standards" },
  { itemId: "cmff2usje001esbb3xtcdk120", variableId: "5.3", questionNumber: 3, schemaLabel: "Unrelenting Standards" },
  
  // 5.4 Punitiveness (3 items)
  { itemId: "cmff2usjf001fsbb3ncx82jxt", variableId: "5.4", questionNumber: 1, schemaLabel: "Punitiveness" },
  { itemId: "cmff2usjg001gsbb3uiepg7e7", variableId: "5.4", questionNumber: 2, schemaLabel: "Punitiveness" },
  { itemId: "cmff2usji001hsbb3gcrd9655", variableId: "5.4", questionNumber: 3, schemaLabel: "Punitiveness" },
]

/**
 * Get variable ID for a LASBI item ID
 */
export function getLASBIVariableId(itemId: string): string | null {
  const mapping = LASBI_ITEM_MAPPINGS.find(m => m.itemId === itemId)
  return mapping?.variableId || null
}

/**
 * Get all mappings for a variable ID
 */
export function getLASBIItemsForVariable(variableId: string): LASBIItemMapping[] {
  return LASBI_ITEM_MAPPINGS.filter(m => m.variableId === variableId)
}

/**
 * Get schema label for a LASBI item ID
 */
export function getLASBISchemaLabel(itemId: string): string | null {
  const mapping = LASBI_ITEM_MAPPINGS.find(m => m.itemId === itemId)
  return mapping?.schemaLabel || null
}

/**
 * Check if an item ID is a modern LASBI ID format
 */
export function isModernLASBIItemId(itemId: string): boolean {
  return /^cmf[a-z0-9]{20,}$/.test(itemId)
}

export default LASBI_ITEM_MAPPINGS
