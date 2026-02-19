import type { FinalReviewStatus, ReviewDecision, SessionStatus } from "@/server/types/domain";

export interface SessionListItem {
  id: string;
  fellowName: string;
  occurredAt: string;
  groupId: string;
  displayStatus: SessionStatus;
}

export type SessionStatusFilter = SessionStatus | "ALL";

export interface SessionListQuery {
  page: number;
  pageSize: number;
  search: string;
  status: SessionStatusFilter;
}

export interface SessionListResult {
  items: SessionListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export type SafetyFlag = "SAFE" | "RISK";

export type ContentCoverageRating = "MISSED" | "PARTIAL" | "COMPLETE";
export type FacilitationQualityRating = "POOR" | "ADEQUATE" | "EXCELLENT";
export type ProtocolSafetyRating = "VIOLATION" | "MINOR_DRIFT" | "ADHERENT";

export type MetricScore = 1 | 2 | 3;

export interface ScoredMetricDTO<TRating extends string> {
  score: MetricScore;
  rating: TRating;
  justification: string;
  evidenceQuotes: string[];
}

export interface SessionAnalysisMetaDTO {
  model: string;
  promptVersion: string;
  generatedAt: string;
  latencyMs?: number;
  transcriptCharsSent?: number;
  transcriptWasTruncated?: boolean;
  transcriptWindowCount?: number;
  transcriptRiskLinesIncluded?: number;
}

export interface SessionAnalysisDTO {
  sessionSummary: string;
  contentCoverage: ScoredMetricDTO<ContentCoverageRating>;
  facilitationQuality: ScoredMetricDTO<FacilitationQualityRating>;
  protocolSafety: ScoredMetricDTO<ProtocolSafetyRating>;
  riskDetection: {
    flag: SafetyFlag;
    rationale: string;
    extractedQuotes: string[];
    requiresSupervisorReview: boolean;
  };
  meta: SessionAnalysisMetaDTO;
}

export interface SessionDetailDTO {
  id: string;
  fellowName: string;
  occurredAt: string;
  groupId: string;
  transcriptText: string;
  finalStatus?: SessionStatus | null;
  analysis?: SessionAnalysisDTO;
  review?: {
    decision: ReviewDecision;
    finalStatus: SessionStatus;
    note: string;
    updatedAt: string;
  };
}

export interface SupervisorReviewInput {
  decision: ReviewDecision;
  finalStatus: FinalReviewStatus;
  note: string;
}
