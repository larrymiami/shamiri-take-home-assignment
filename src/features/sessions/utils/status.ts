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
    analysisSafetyFlag: analysis?.riskDetection.flag
  });
}

interface DeriveSessionStatusFromSafetyFlagInput {
  finalStatus?: SessionStatus | null;
  analysisSafetyFlag?: "SAFE" | "RISK" | null;
}

export function deriveSessionDisplayStatusFromSafetyFlag({
  finalStatus,
  analysisSafetyFlag
}: DeriveSessionStatusFromSafetyFlagInput): SessionStatus {
  if (finalStatus) {
    return finalStatus;
  }

  if (analysisSafetyFlag === "RISK") {
    return "RISK";
  }

  if (analysisSafetyFlag === "SAFE") {
    return "SAFE";
  }

  return "PROCESSED";
}
