export const SESSION_STATUS_VALUES = ["PROCESSED", "FLAGGED_FOR_REVIEW", "SAFE", "RISK"] as const;

export type SessionStatus = (typeof SESSION_STATUS_VALUES)[number];
