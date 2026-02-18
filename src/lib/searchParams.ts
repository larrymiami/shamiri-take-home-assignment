import { SESSION_STATUS_VALUES } from "@/server/types/domain";
import type { SessionStatusFilter } from "@/features/sessions/types";

// Shared URL parsing helpers keep page + API behavior in sync.
export function parsePositiveInt(value: string | null | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

export function parseSessionStatusFilter(status: string | null | undefined): SessionStatusFilter {
  if (!status || status === "ALL") {
    return "ALL";
  }

  if (SESSION_STATUS_VALUES.includes(status as (typeof SESSION_STATUS_VALUES)[number])) {
    return status as SessionStatusFilter;
  }

  return "ALL";
}
