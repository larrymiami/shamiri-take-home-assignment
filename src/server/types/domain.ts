export const SESSION_STATUS_VALUES = ["PROCESSED", "FLAGGED_FOR_REVIEW", "SAFE", "RISK"] as const;
export const REVIEW_DECISION_VALUES = ["VALIDATED", "REJECTED", "OVERRIDDEN"] as const;

export type SessionStatus = (typeof SESSION_STATUS_VALUES)[number];
export type ReviewDecision = (typeof REVIEW_DECISION_VALUES)[number];
