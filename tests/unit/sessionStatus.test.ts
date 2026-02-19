import {
  deriveSessionDisplayStatus,
  deriveSessionDisplayStatusFromSafetyFlag
} from "@/features/sessions/utils/status";

describe("session display status derivation", () => {
  it("prioritizes human finalStatus over AI output", () => {
    expect(
      deriveSessionDisplayStatusFromSafetyFlag({
        finalStatus: "SAFE",
        analysisSafetyFlag: "RISK",
        analysisRequiresSupervisorReview: true
      })
    ).toBe("SAFE");
  });

  it("treats legacy PROCESSED finalStatus as pending and derives from AI", () => {
    expect(
      deriveSessionDisplayStatusFromSafetyFlag({
        finalStatus: "PROCESSED",
        analysisSafetyFlag: "SAFE",
        analysisRequiresSupervisorReview: false
      })
    ).toBe("SAFE");
  });

  it("maps AI risk to RISK when no human status exists", () => {
    expect(
      deriveSessionDisplayStatusFromSafetyFlag({
        finalStatus: null,
        analysisSafetyFlag: "RISK",
        analysisRequiresSupervisorReview: true
      })
    ).toBe("RISK");
  });

  it("maps SAFE + requiresSupervisorReview to FLAGGED_FOR_REVIEW", () => {
    expect(
      deriveSessionDisplayStatusFromSafetyFlag({
        finalStatus: null,
        analysisSafetyFlag: "SAFE",
        analysisRequiresSupervisorReview: true
      })
    ).toBe("FLAGGED_FOR_REVIEW");
  });

  it("maps SAFE with no triage flag to SAFE", () => {
    expect(
      deriveSessionDisplayStatusFromSafetyFlag({
        finalStatus: null,
        analysisSafetyFlag: "SAFE",
        analysisRequiresSupervisorReview: false
      })
    ).toBe("SAFE");
  });

  it("falls back to PROCESSED when no human or AI signal exists", () => {
    expect(
      deriveSessionDisplayStatusFromSafetyFlag({
        finalStatus: null,
        analysisSafetyFlag: null,
        analysisRequiresSupervisorReview: null
      })
    ).toBe("PROCESSED");
  });

  it("derives from full analysis DTO using same precedence", () => {
    const status = deriveSessionDisplayStatus({
      finalStatus: null,
      analysis: {
        sessionSummary: "One. Two. Three.",
        contentCoverage: {
          score: 2,
          rating: "PARTIAL",
          justification: "Enough justification text for schema-like shape.",
          evidenceQuotes: ["effort matters more than talent"]
        },
        facilitationQuality: {
          score: 2,
          rating: "ADEQUATE",
          justification: "Enough justification text for schema-like shape.",
          evidenceQuotes: ["what do you think changed"]
        },
        protocolSafety: {
          score: 3,
          rating: "ADHERENT",
          justification: "Enough justification text for schema-like shape.",
          evidenceQuotes: ["we stayed within curriculum"]
        },
        riskDetection: {
          flag: "SAFE",
          rationale: "No explicit high-risk threshold met.",
          extractedQuotes: [],
          requiresSupervisorReview: true
        },
        meta: {
          model: "gpt-4o-mini",
          promptVersion: "session-analysis-v4",
          generatedAt: new Date().toISOString()
        }
      }
    });

    expect(status).toBe("FLAGGED_FOR_REVIEW");
  });
});
