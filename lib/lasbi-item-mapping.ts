
/**
 * LASBI Item ID to Variable ID Mapping - 108 Item Version
 * Maps modern LASBI complex item IDs to canonical variable IDs for Bridge V2 processing
 * Updated to support 6 items per schema (108 total items)
 */

interface LASBIItemMapping {
  itemId: string
  variableId: string
  questionNumber: number
  schemaLabel: string
}

// Expanded LASBI structure with 108 items mapping to 18 schemas
// Each schema has 6 questions, distributed across the 108 items
export const LASBI_ITEM_MAPPINGS: LASBIItemMapping[] = [
  // Section 1: Disconnection & Rejection (1.1 - 1.5) - 30 items
  // 1.1 Abandonment/Instability (6 items)
  { itemId: "cmff2ushm0000sbb3xz75fwkz", variableId: "1.1", questionNumber: 1, schemaLabel: "Abandonment" },
  { itemId: "cmff2ushp0001sbb3pndmp2so", variableId: "1.1", questionNumber: 2, schemaLabel: "Abandonment" },
  { itemId: "cmff2ushq0002sbb32tnxfwlh", variableId: "1.1", questionNumber: 3, schemaLabel: "Abandonment" },
  { itemId: "cmh38aen0001xsbb3k9m2n4p5", variableId: "1.1", questionNumber: 4, schemaLabel: "Abandonment" },
  { itemId: "cmh38aen0002xsbb3t7w8q1r6", variableId: "1.1", questionNumber: 5, schemaLabel: "Abandonment" },
  { itemId: "cmh38aen0003xsbb3u3j5h9s7", variableId: "1.1", questionNumber: 6, schemaLabel: "Abandonment" },
  
  // 1.2 Defectiveness/Shame (6 items)
  { itemId: "cmff2ushr0003sbb3flyzk52v", variableId: "1.2", questionNumber: 1, schemaLabel: "Defectiveness/Shame" },
  { itemId: "cmff2usht0004sbb3ffbtcrz1", variableId: "1.2", questionNumber: 2, schemaLabel: "Defectiveness/Shame" },
  { itemId: "cmff2ushu0005sbb3sg7x6xou", variableId: "1.2", questionNumber: 3, schemaLabel: "Defectiveness/Shame" },
  { itemId: "cmh38aen0004xsbb3v2k6m8t9", variableId: "1.2", questionNumber: 4, schemaLabel: "Defectiveness/Shame" },
  { itemId: "cmh38aen0005xsbb3w5n7p9u1", variableId: "1.2", questionNumber: 5, schemaLabel: "Defectiveness/Shame" },
  { itemId: "cmh38aen0006xsbb3x8q1r2v3", variableId: "1.2", questionNumber: 6, schemaLabel: "Defectiveness/Shame" },
  
  // 1.3 Emotional Deprivation (6 items)
  { itemId: "cmff2ushv0006sbb3o6qo5u3p", variableId: "1.3", questionNumber: 1, schemaLabel: "Emotional Deprivation" },
  { itemId: "cmff2ushx0007sbb343uaq7c3", variableId: "1.3", questionNumber: 2, schemaLabel: "Emotional Deprivation" },
  { itemId: "cmff2ushy0008sbb3o690p5jb", variableId: "1.3", questionNumber: 3, schemaLabel: "Emotional Deprivation" },
  { itemId: "cmh38aen0007xsbb3y1t3s5w4", variableId: "1.3", questionNumber: 4, schemaLabel: "Emotional Deprivation" },
  { itemId: "cmh38aen0008xsbb3z4w6t8x5", variableId: "1.3", questionNumber: 5, schemaLabel: "Emotional Deprivation" },
  { itemId: "cmh38aen0009xsbb3a7z9u1y6", variableId: "1.3", questionNumber: 6, schemaLabel: "Emotional Deprivation" },
  
  // 1.4 Mistrust/Abuse (6 items)
  { itemId: "cmff2ushz0009sbb3kpmyd2vv", variableId: "1.4", questionNumber: 1, schemaLabel: "Mistrust/Abuse" },
  { itemId: "cmff2usi1000asbb3g2b2rrbg", variableId: "1.4", questionNumber: 2, schemaLabel: "Mistrust/Abuse" },
  { itemId: "cmff2usi2000bsbb38ksh1592", variableId: "1.4", questionNumber: 3, schemaLabel: "Mistrust/Abuse" },
  { itemId: "cmh38aen000axsbb3b0c2v4z7", variableId: "1.4", questionNumber: 4, schemaLabel: "Mistrust/Abuse" },
  { itemId: "cmh38aen000bxsbb3c3f5w7a8", variableId: "1.4", questionNumber: 5, schemaLabel: "Mistrust/Abuse" },
  { itemId: "cmh38aen000cxsbb3d6i8x0b9", variableId: "1.4", questionNumber: 6, schemaLabel: "Mistrust/Abuse" },
  
  // 1.5 Social Isolation (6 items)
  { itemId: "cmff2usi3000csbb3kvmjjlqx", variableId: "1.5", questionNumber: 1, schemaLabel: "Social Isolation" },
  { itemId: "cmff2usi4000dsbb3cd5wlepc", variableId: "1.5", questionNumber: 2, schemaLabel: "Social Isolation" },
  { itemId: "cmff2usi5000esbb3ylvjxwkg", variableId: "1.5", questionNumber: 3, schemaLabel: "Social Isolation" },
  { itemId: "cmh38aen000dxsbb3e9l1y3c1", variableId: "1.5", questionNumber: 4, schemaLabel: "Social Isolation" },
  { itemId: "cmh38aen000exsbb3f2o4z6d2", variableId: "1.5", questionNumber: 5, schemaLabel: "Social Isolation" },
  { itemId: "cmh38aen000fxsbb3g5r7a9e3", variableId: "1.5", questionNumber: 6, schemaLabel: "Social Isolation" },
  
  // Section 2: Impaired Autonomy & Performance (2.1 - 2.4) - 24 items
  // 2.1 Dependence/Incompetence (6 items)
  { itemId: "cmff2usi7000fsbb3ywkt6zp7", variableId: "2.1", questionNumber: 1, schemaLabel: "Dependence/Incompetence" },
  { itemId: "cmff2usi8000gsbb3a09v5bws", variableId: "2.1", questionNumber: 2, schemaLabel: "Dependence/Incompetence" },
  { itemId: "cmff2usi9000hsbb3azlj0bkv", variableId: "2.1", questionNumber: 3, schemaLabel: "Dependence/Incompetence" },
  { itemId: "cmh38aen000gxsbb3h8u0b2f4", variableId: "2.1", questionNumber: 4, schemaLabel: "Dependence/Incompetence" },
  { itemId: "cmh38aen000hxsbb3i1x3c5g5", variableId: "2.1", questionNumber: 5, schemaLabel: "Dependence/Incompetence" },
  { itemId: "cmh38aen000ixsbb3j4a6d8h6", variableId: "2.1", questionNumber: 6, schemaLabel: "Dependence/Incompetence" },
  
  // 2.2 Vulnerability to Harm (6 items)
  { itemId: "cmff2usib000isbb3c7s52ubh", variableId: "2.2", questionNumber: 1, schemaLabel: "Vulnerability to Harm" },
  { itemId: "cmff2usic000jsbb3rs3bs16v", variableId: "2.2", questionNumber: 2, schemaLabel: "Vulnerability to Harm" },
  { itemId: "cmff2usid000ksbb3i2jyy5oj", variableId: "2.2", questionNumber: 3, schemaLabel: "Vulnerability to Harm" },
  { itemId: "cmh38aen000jxsbb3k7d9e1i7", variableId: "2.2", questionNumber: 4, schemaLabel: "Vulnerability to Harm" },
  { itemId: "cmh38aen000kxsbb3l0g2f4j8", variableId: "2.2", questionNumber: 5, schemaLabel: "Vulnerability to Harm" },
  { itemId: "cmh38aen000lxsbb3m3j5g7k9", variableId: "2.2", questionNumber: 6, schemaLabel: "Vulnerability to Harm" },
  
  // 2.3 Enmeshment/Undeveloped Self (6 items)
  { itemId: "cmff2usie000lsbb3euvd2b7y", variableId: "2.3", questionNumber: 1, schemaLabel: "Enmeshment/Undeveloped Self" },
  { itemId: "cmff2usif000msbb3v6yu4bd0", variableId: "2.3", questionNumber: 2, schemaLabel: "Enmeshment/Undeveloped Self" },
  { itemId: "cmff2usih000nsbb3c5rnpxfd", variableId: "2.3", questionNumber: 3, schemaLabel: "Enmeshment/Undeveloped Self" },
  { itemId: "cmh38aen000mxsbb3n6m8h0l1", variableId: "2.3", questionNumber: 4, schemaLabel: "Enmeshment/Undeveloped Self" },
  { itemId: "cmh38aen000nxsbb3o9p1i3m2", variableId: "2.3", questionNumber: 5, schemaLabel: "Enmeshment/Undeveloped Self" },
  { itemId: "cmh38aen000oxsbb3p2s4j6n3", variableId: "2.3", questionNumber: 6, schemaLabel: "Enmeshment/Undeveloped Self" },
  
  // 2.4 Failure (6 items)
  { itemId: "cmff2usii000osbb3lmntidwh", variableId: "2.4", questionNumber: 1, schemaLabel: "Failure" },
  { itemId: "cmff2usij000psbb3ny55yrs2", variableId: "2.4", questionNumber: 2, schemaLabel: "Failure" },
  { itemId: "cmff2usik000qsbb3iuypzlgo", variableId: "2.4", questionNumber: 3, schemaLabel: "Failure" },
  { itemId: "cmh38aen000pxsbb3q5v7k9o4", variableId: "2.4", questionNumber: 4, schemaLabel: "Failure" },
  { itemId: "cmh38aen000qxsbb3r8y0l2p5", variableId: "2.4", questionNumber: 5, schemaLabel: "Failure" },
  { itemId: "cmh38aen000rxsbb3s1b3m5q6", variableId: "2.4", questionNumber: 6, schemaLabel: "Failure" },
  
  // Section 3: Impaired Limits (3.1 - 3.2) - 12 items
  // 3.1 Entitlement/Grandiosity (6 items)
  { itemId: "cmff2usil000rsbb3dr1qqw4h", variableId: "3.1", questionNumber: 1, schemaLabel: "Entitlement/Grandiosity" },
  { itemId: "cmff2usin000ssbb3ahr8x8p1", variableId: "3.1", questionNumber: 2, schemaLabel: "Entitlement/Grandiosity" },
  { itemId: "cmff2usio000tsbb3tbvbwh4s", variableId: "3.1", questionNumber: 3, schemaLabel: "Entitlement/Grandiosity" },
  { itemId: "cmh38aen000sxsbb3t4e6n8r7", variableId: "3.1", questionNumber: 4, schemaLabel: "Entitlement/Grandiosity" },
  { itemId: "cmh38aen000txsbb3u7h9o1s8", variableId: "3.1", questionNumber: 5, schemaLabel: "Entitlement/Grandiosity" },
  { itemId: "cmh38aen000uxsbb3v0k2p4t9", variableId: "3.1", questionNumber: 6, schemaLabel: "Entitlement/Grandiosity" },
  
  // 3.2 Insufficient Self-Control (6 items)
  { itemId: "cmff2usip000usbb39ky60h0y", variableId: "3.2", questionNumber: 1, schemaLabel: "Insufficient Self-Control" },
  { itemId: "cmff2usiq000vsbb3c8yb73sj", variableId: "3.2", questionNumber: 2, schemaLabel: "Insufficient Self-Control" },
  { itemId: "cmff2usir000wsbb3qg5zscpd", variableId: "3.2", questionNumber: 3, schemaLabel: "Insufficient Self-Control" },
  { itemId: "cmh38aen000vxsbb3w3n5q7u1", variableId: "3.2", questionNumber: 4, schemaLabel: "Insufficient Self-Control" },
  { itemId: "cmh38aen000wxsbb3x6q8r0v2", variableId: "3.2", questionNumber: 5, schemaLabel: "Insufficient Self-Control" },
  { itemId: "cmh38aen000xxsbb3y9t1s3w3", variableId: "3.2", questionNumber: 6, schemaLabel: "Insufficient Self-Control" },
  
  // Section 4: Other-Directedness (4.1 - 4.3) - 18 items
  // 4.1 Subjugation (6 items)
  { itemId: "cmff2usit000xsbb3swkgowx8", variableId: "4.1", questionNumber: 1, schemaLabel: "Subjugation" },
  { itemId: "cmff2usiu000ysbb3v302gutd", variableId: "4.1", questionNumber: 2, schemaLabel: "Subjugation" },
  { itemId: "cmff2usiv000zsbb3a6l4t6i2", variableId: "4.1", questionNumber: 3, schemaLabel: "Subjugation" },
  { itemId: "cmh38aen000yxsbb3z2w4t6x4", variableId: "4.1", questionNumber: 4, schemaLabel: "Subjugation" },
  { itemId: "cmh38aen000zxsbb3a5z7u9y5", variableId: "4.1", questionNumber: 5, schemaLabel: "Subjugation" },
  { itemId: "cmh38aen0010xsbb3b8c0v2z6", variableId: "4.1", questionNumber: 6, schemaLabel: "Subjugation" },
  
  // 4.2 Self-Sacrifice (6 items)
  { itemId: "cmff2usix0010sbb3tmc3fibw", variableId: "4.2", questionNumber: 1, schemaLabel: "Self-Sacrifice" },
  { itemId: "cmff2usiy0011sbb3i0rwfy7i", variableId: "4.2", questionNumber: 2, schemaLabel: "Self-Sacrifice" },
  { itemId: "cmff2usiz0012sbb36w0dxezg", variableId: "4.2", questionNumber: 3, schemaLabel: "Self-Sacrifice" },
  { itemId: "cmh38aen0011xsbb3c1f3w5a7", variableId: "4.2", questionNumber: 4, schemaLabel: "Self-Sacrifice" },
  { itemId: "cmh38aen0012xsbb3d4i6x8b8", variableId: "4.2", questionNumber: 5, schemaLabel: "Self-Sacrifice" },
  { itemId: "cmh38aen0013xsbb3e7l9y1c9", variableId: "4.2", questionNumber: 6, schemaLabel: "Self-Sacrifice" },
  
  // 4.3 Approval-Seeking (6 items)
  { itemId: "cmff2usj00013sbb3f2qfypqi", variableId: "4.3", questionNumber: 1, schemaLabel: "Approval-Seeking" },
  { itemId: "cmff2usj20014sbb3x0nvy9n4", variableId: "4.3", questionNumber: 2, schemaLabel: "Approval-Seeking" },
  { itemId: "cmff2usj30015sbb3132vwvuq", variableId: "4.3", questionNumber: 3, schemaLabel: "Approval-Seeking" },
  { itemId: "cmh38aen0014xsbb3f0o2z4d1", variableId: "4.3", questionNumber: 4, schemaLabel: "Approval-Seeking" },
  { itemId: "cmh38aen0015xsbb3g3r5a7e2", variableId: "4.3", questionNumber: 5, schemaLabel: "Approval-Seeking" },
  { itemId: "cmh38aen0016xsbb3h6u8b0f3", variableId: "4.3", questionNumber: 6, schemaLabel: "Approval-Seeking" },
  
  // Section 5: Overvigilance & Inhibition (5.1 - 5.4) - 24 items
  // 5.1 Negativity/Pessimism (6 items)
  { itemId: "cmff2usj40016sbb39ekru832", variableId: "5.1", questionNumber: 1, schemaLabel: "Negativity/Pessimism" },
  { itemId: "cmff2usj50017sbb3dwf4gj9i", variableId: "5.1", questionNumber: 2, schemaLabel: "Negativity/Pessimism" },
  { itemId: "cmff2usj60018sbb34db4vsk6", variableId: "5.1", questionNumber: 3, schemaLabel: "Negativity/Pessimism" },
  { itemId: "cmh38aen0017xsbb3i9x1c3g4", variableId: "5.1", questionNumber: 4, schemaLabel: "Negativity/Pessimism" },
  { itemId: "cmh38aen0018xsbb3j2a4d6h5", variableId: "5.1", questionNumber: 5, schemaLabel: "Negativity/Pessimism" },
  { itemId: "cmh38aen0019xsbb3k5d7e9i6", variableId: "5.1", questionNumber: 6, schemaLabel: "Negativity/Pessimism" },
  
  // 5.2 Emotional Inhibition (6 items)
  { itemId: "cmff2usj80019sbb3hoe1jieo", variableId: "5.2", questionNumber: 1, schemaLabel: "Emotional Inhibition" },
  { itemId: "cmff2usj9001asbb3vccgx7en", variableId: "5.2", questionNumber: 2, schemaLabel: "Emotional Inhibition" },
  { itemId: "cmff2usja001bsbb3j97bp80c", variableId: "5.2", questionNumber: 3, schemaLabel: "Emotional Inhibition" },
  { itemId: "cmh38aen001axsbb3l8g0f2j7", variableId: "5.2", questionNumber: 4, schemaLabel: "Emotional Inhibition" },
  { itemId: "cmh38aen001bxsbb3m1j3g5k8", variableId: "5.2", questionNumber: 5, schemaLabel: "Emotional Inhibition" },
  { itemId: "cmh38aen001cxsbb3n4m6h8l9", variableId: "5.2", questionNumber: 6, schemaLabel: "Emotional Inhibition" },
  
  // 5.3 Unrelenting Standards (6 items)
  { itemId: "cmff2usjb001csbb31c8pl4lv", variableId: "5.3", questionNumber: 1, schemaLabel: "Unrelenting Standards" },
  { itemId: "cmff2usjd001dsbb3se57nmbu", variableId: "5.3", questionNumber: 2, schemaLabel: "Unrelenting Standards" },
  { itemId: "cmff2usje001esbb3xtcdk120", variableId: "5.3", questionNumber: 3, schemaLabel: "Unrelenting Standards" },
  { itemId: "cmh38aen001dxsbb3o7p9i1m1", variableId: "5.3", questionNumber: 4, schemaLabel: "Unrelenting Standards" },
  { itemId: "cmh38aen001exsbb3p0s2j4n2", variableId: "5.3", questionNumber: 5, schemaLabel: "Unrelenting Standards" },
  { itemId: "cmh38aen001fxsbb3q3v5k7o3", variableId: "5.3", questionNumber: 6, schemaLabel: "Unrelenting Standards" },
  
  // 5.4 Punitiveness (6 items)
  { itemId: "cmff2usjf001fsbb3ncx82jxt", variableId: "5.4", questionNumber: 1, schemaLabel: "Punitiveness" },
  { itemId: "cmff2usjg001gsbb3uiepg7e7", variableId: "5.4", questionNumber: 2, schemaLabel: "Punitiveness" },
  { itemId: "cmff2usji001hsbb3gcrd9655", variableId: "5.4", questionNumber: 3, schemaLabel: "Punitiveness" },
  { itemId: "cmh38aen001gxsbb3r6y8l0p4", variableId: "5.4", questionNumber: 4, schemaLabel: "Punitiveness" },
  { itemId: "cmh38aen001hxsbb3s9b1m3q5", variableId: "5.4", questionNumber: 5, schemaLabel: "Punitiveness" },
  { itemId: "cmh38aen001ixsbb3t2e4n6r6", variableId: "5.4", questionNumber: 6, schemaLabel: "Punitiveness" },
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
  return /^cmf[a-z0-9]{20,}$/.test(itemId) || /^cmh[a-z0-9]{20,}$/.test(itemId)
}

export default LASBI_ITEM_MAPPINGS
