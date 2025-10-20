
import { z } from "zod"

// Legacy import schema for backward compatibility
export const ImportSchema = z.object({
  respondent: z.object({ 
    id: z.string() 
  }),
  assessment: z.object({
    assessmentId: z.string(),
    completedAt: z.string().datetime(),
    instrument: z.any()
  }),
  schemaVersion: z.string().optional().default("1.0.0"),
  analysisVersion: z.string().optional().default("1.0.0"),
  provenance: z.any().optional(),
  // Allow additional fields for analysis results
  schemaScores: z.any().optional(),
  domainScores: z.any().optional(),
  modeScores: z.any().optional(),
  riskFlags: z.any().optional(),
  analysis: z.any().optional()
}).passthrough() // Allow additional unknown fields
.transform((data) => ({
  respondentId: data.respondent.id,
  assessmentId: data.assessment.assessmentId,
  completedAt: data.assessment.completedAt,
  schemaVersion: data.schemaVersion,
  analysisVersion: data.analysisVersion,
  raw: data
}))

export type ImportData = z.infer<typeof ImportSchema>

// Re-export QA validation schemas for new bridge system
export { 
  ImportPayloadSchema as QAImportSchema,
  type ImportPayload as QAImportPayload 
} from './types/immutable-contracts'
