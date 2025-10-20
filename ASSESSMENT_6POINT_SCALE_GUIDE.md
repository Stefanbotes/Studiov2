# Assessment System - 6-Point Likert Scale Guide

## Overview
Studio 2 has been updated to use a **6-point Likert scale** with **6 items per schema** (increased from 3 items).

## Changes Summary

### Scale Structure
- **Previous**: 5-point Likert scale (assumed)
- **Current**: 6-point Likert scale
- **Range**: 1-6 (no neutral midpoint - forces respondents to lean toward agreement or disagreement)

### Items Per Schema
- **Previous**: 3 reflection statements per schema
- **Current**: 6 reflection statements per schema
- **Total Assessment Items**: 108 items (18 schemas × 6 items each)

## 6-Point Likert Scale Anchors

| Value | Label | Description |
|-------|-------|-------------|
| 1 | Completely disagree | Strong disagreement with the statement |
| 2 | Mostly disagree | Moderate disagreement |
| 3 | Slightly disagree | Mild disagreement |
| 4 | Slightly agree | Mild agreement |
| 5 | Mostly agree | Moderate agreement |
| 6 | Completely agree | Strong agreement with the statement |

## Advantages of 6-Point Scale

1. **No Neutral Option**: Forces respondents to take a position, reducing neutral/fence-sitting responses
2. **Better Granularity**: Provides more nuanced response options
3. **Clearer Data**: Easier to analyze agreement vs. disagreement patterns
4. **Statistical Benefits**: Better distribution and variance for analysis

## Schema Reflection Statements

Each schema now has 6 reflection statements. Example for **Abandonment/Instability**:

1. "If I don't stay close, they'll leave me."
2. "I check in constantly."
3. "I worry they'll leave without me."
4. "I need frequent reassurance from my team."
5. "I fear being replaced or forgotten."
6. "I struggle when people are unavailable."

## Import JSON Format

### Sample Structure

```json
{
  "schemaVersion": "1.0",
  "instrument": {
    "name": "Schema Questionnaire - 6 Point Scale",
    "version": "2.0"
  },
  "respondent": {
    "id": "respondent-12345"
  },
  "assessment": {
    "assessmentId": "assessment-67890",
    "completedAt": "2025-10-20T10:00:00.000Z"
  },
  "items": [
    {
      "schema_id": "abandonment_instability",
      "item_number": 1,
      "raw": 5,
      "tscore": 65,
      "percentile": 92,
      "response_text": "If I don't stay close, they'll leave me.",
      "likert_scale": "6-point",
      "reverse": false,
      "weight": 1
    },
    // ... 5 more items for this schema
    // ... repeat for all 18 schemas
  ],
  "metadata": {
    "scale_info": {
      "type": "6-point Likert scale",
      "items_per_schema": 6,
      "total_schemas": 18,
      "total_items": 108
    }
  }
}
```

## Scoring Guidelines

### Raw Scores
- **Range**: 1-6 per item
- **Schema Total**: Sum of 6 items = 6-36 per schema
- **Mean Score**: Total ÷ 6 = 1.0-6.0

### T-Score Conversion
T-scores should be calculated based on normative data for the 6-point scale:
- Mean: 50
- Standard Deviation: 10
- Clinical significance threshold: T ≥ 60

### Percentile Ranks
Percentile ranks should be based on the 6-point scale distribution.

## Implementation Files

### Updated Files
1. **`data/schema-pack.json`**: Updated with 6 reflection statements per schema
2. **`data/sample-import-6point-scale.json`**: Sample import file demonstrating the new format
3. **`scripts/update-schema-pack-6-items.js`**: Script used to update the schema pack

### Schema Pack Version
- **Version**: `v1760958748094_6items`
- **Generated**: 2025-10-20
- **Schemas Updated**: 18/18

## All 18 Schemas with 6 Items Each

1. abandonment_instability
2. defectiveness_shame
3. emotional_deprivation
4. mistrust_abuse
5. social_isolation_alienation
6. dependence_incompetence
7. vulnerability_to_harm_illness
8. enmeshment_undeveloped_self
9. failure
10. entitlement_grandiosity
11. insufficient_self_control_discipline
12. subjugation
13. self_sacrifice
14. approval_seeking_recognition_seeking
15. negativity_pessimism
16. emotional_inhibition
17. unrelenting_standards_hypercriticalness
18. punitiveness

## Import Instructions

### Creating a Complete Assessment File

To import a complete assessment with the 6-point scale:

1. Use the format in `data/sample-import-6point-scale.json`
2. Include all 18 schemas
3. Provide 6 items per schema (108 total items)
4. Use raw scores 1-6 for each item
5. Optionally include t-scores and percentiles
6. Set `"likert_scale": "6-point"` in metadata

### Validation Rules

- Each schema must have exactly 6 items
- Raw scores must be 1-6
- All 18 canonical schema IDs must be present
- T-scores (if provided) should reflect 6-point scale norms

## Backward Compatibility

- The system still accepts the old import format for existing data
- New imports should use the 6-point scale format
- The API automatically detects and processes both formats

## Testing Your Import

1. Use the sample file: `data/sample-import-6point-scale.json`
2. Import via the assessment import API endpoint
3. Verify all 6 items per schema are processed correctly
4. Check that scoring calculations use the 1-6 range

## Support

For questions or issues with the 6-point scale implementation, contact your system administrator.

---

**Last Updated**: October 20, 2025  
**Studio Version**: Studio 2  
**Scale Version**: 6-point Likert (v2.0)
