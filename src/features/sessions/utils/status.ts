import type { SessionAnalysisDTO } from "@/features/sessions/types";
import type { SessionStatus } from "@/server/types/domain";

interface DeriveSessionStatusInput {
  finalStatus?: SessionStatus | null;
  analysis?: SessionAnalysisDTO | null;
}

export function deriveSessionDisplayStatus({
  finalStatus,
  analysis
}: DeriveSessionStatusInput): SessionStatus {
  return deriveSessionDisplayStatusFromSafetyFlag({
    finalStatus,
    analysisSafetyFlag: analysis?.riskDetection.flag,
    analysisRequiresSupervisorReview: analysis?.riskDetection.requiresSupervisorReview
  });
}

interface DeriveSessionStatusFromSafetyFlagInput {
  finalStatus?: SessionStatus | null;
  analysisSafetyFlag?: "SAFE" | "RISK" | null;
  analysisRequiresSupervisorReview?: boolean | null;
}

export function deriveSessionDisplayStatusFromSafetyFlag({
  finalStatus,
  analysisSafetyFlag,
  analysisRequiresSupervisorReview
}: DeriveSessionStatusFromSafetyFlagInput): SessionStatus {
  // Human review is canonical for explicit decision outcomes.
  // Legacy `PROCESSED` should be treated as "pending review", not a final outcome.
  if (finalStatus && finalStatus !== "PROCESSED") {
    return finalStatus;
  }

  if (analysisSafetyFlag === "RISK") {
    return "RISK";
  }

  if (analysisRequiresSupervisorReview) {
    return "FLAGGED_FOR_REVIEW";
  }

  if (analysisSafetyFlag === "SAFE") {
    return "SAFE";
  }

  return "PROCESSED";
}
