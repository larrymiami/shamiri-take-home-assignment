import { z } from "zod";

const sentenceLikeSegments = (value: string): string[] =>
  value
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

const threeSentenceSummarySchema = z
  .string()
  .min(20)
  .superRefine((value, ctx) => {
    const sentenceCount = sentenceLikeSegments(value).length;

    if (sentenceCount !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sessionSummary must be exactly 3 sentences"
      });
    }
  });

const metricScoreSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

const evidenceQuotesSchema = z.array(z.string().min(8)).min(1).max(3);

const scoredMetricBaseSchema = z.object({
  score: metricScoreSchema,
  justification: z.string().min(20),
  evidenceQuotes: evidenceQuotesSchema
});

const riskDetectionSchema = z
  .object({
    flag: z.enum(["SAFE", "RISK"]),
    rationale: z.string().min(10),
    extractedQuotes: z.array(z.string().min(8)).max(3)
  })
  .superRefine((value, ctx) => {
    if (value.flag === "RISK" && value.extractedQuotes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["extractedQuotes"],
        message: "RISK requires at least one extracted quote"
      });
    }

    if (value.flag === "SAFE" && value.extractedQuotes.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["extractedQuotes"],
        message: "SAFE must not include extracted risk quotes"
      });
    }
  });

export const SessionAnalysisLLMOutputSchema = z.object({
  sessionSummary: threeSentenceSummarySchema,
  contentCoverage: scoredMetricBaseSchema.extend({
    rating: z.enum(["MISSED", "PARTIAL", "COMPLETE"])
  }),
  facilitationQuality: scoredMetricBaseSchema.extend({
    rating: z.enum(["POOR", "ADEQUATE", "EXCELLENT"])
  }),
  protocolSafety: scoredMetricBaseSchema.extend({
    rating: z.enum(["VIOLATION", "MINOR_DRIFT", "ADHERENT"])
  }),
  riskDetection: riskDetectionSchema
});

export const SessionAnalysisMetaSchema = z.object({
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  generatedAt: z.string().datetime(),
  latencyMs: z.number().int().positive().optional(),
  transcriptCharsSent: z.number().int().positive().optional(),
  transcriptWasTruncated: z.boolean().optional(),
  transcriptWindowCount: z.number().int().positive().optional(),
  transcriptRiskLinesIncluded: z.number().int().nonnegative().optional()
});

export const SessionAnalysisSchema = SessionAnalysisLLMOutputSchema.extend({
  meta: SessionAnalysisMetaSchema
});

const llmOutputJsonSchema = z.toJSONSchema(SessionAnalysisLLMOutputSchema);
delete llmOutputJsonSchema.$schema;

export const SessionAnalysisLLMOutputJSONSchema = llmOutputJsonSchema;

export type SessionAnalysisLLMOutput = z.infer<typeof SessionAnalysisLLMOutputSchema>;
export type SessionAnalysisDTO = z.infer<typeof SessionAnalysisSchema>;
