import { SessionAnalysisSchema } from "@/server/services/ai/schemas";

const basePayload = {
  sessionSummary: "Sentence one. Sentence two. Sentence three.",
  contentCoverage: {
    score: 3 as const,
    rating: "COMPLETE" as const,
    justification: "The concept was explicitly taught with examples and checks for understanding.",
    evidenceQuotes: ["brain is a muscle", "effort matters"]
  },
  facilitationQuality: {
    score: 3 as const,
    rating: "EXCELLENT" as const,
    justification: "Warm, open-ended facilitation with validation and reflection prompts.",
    evidenceQuotes: ["thank you for sharing", "what felt different this time"]
  },
  protocolSafety: {
    score: 3 as const,
    rating: "ADHERENT" as const,
    justification: "The facilitator remained within protocol and avoided medical advice.",
    evidenceQuotes: ["we will stay within Shamiri tools"]
  },
  meta: {
    model: "gpt-4o-mini",
    promptVersion: "session-analysis-v4",
    generatedAt: new Date().toISOString()
  }
};

describe("SessionAnalysisSchema", () => {
  it("accepts SAFE payloads with no extracted risk quotes", () => {
    const parsed = SessionAnalysisSchema.safeParse({
      ...basePayload,
      riskDetection: {
        flag: "SAFE" as const,
        rationale: "No explicit high-risk threshold met in this transcript.",
        extractedQuotes: [],
        requiresSupervisorReview: false
      }
    });

    expect(parsed.success).toBe(true);
  });

  it("requires supervisor review for RISK payloads", () => {
    const parsed = SessionAnalysisSchema.safeParse({
      ...basePayload,
      riskDetection: {
        flag: "RISK" as const,
        rationale: "Explicit first-person self-harm intent is present.",
        extractedQuotes: ["I do not want to wake up tomorrow"],
        requiresSupervisorReview: false
      }
    });

    expect(parsed.success).toBe(false);
  });
});
