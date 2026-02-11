import type { SessionStatus } from "@/server/types/domain";

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
