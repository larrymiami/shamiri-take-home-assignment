import dayjs from "dayjs";
import type {
  SessionListItem,
  SessionListQuery,
  SessionListResult
} from "@/features/sessions/types";
import prisma from "@/server/db/prisma";
import type { SessionStatus } from "@/server/types/domain";

type SessionFindManyArgs = NonNullable<Parameters<typeof prisma.session.findMany>[0]>;
type SessionWhereInput = NonNullable<SessionFindManyArgs["where"]>;
type SessionListRow = {
  id: string;
  groupId: string;
  occurredAt: Date;
  finalStatus: SessionStatus | null;
  fellow: {
    name: string;
  };
};
type SessionMetricRow = {
  occurredAt: Date;
  finalStatus: SessionStatus | null;
};

function deriveDisplayStatus(finalStatus: SessionStatus | null): SessionStatus {
  return finalStatus ?? "PROCESSED";
}

function buildStatusWhere(status: SessionListQuery["status"]): SessionWhereInput | undefined {
  if (status === "ALL") {
    return undefined;
  }

  if (status === "PROCESSED") {
    return {
      OR: [{ finalStatus: null }, { finalStatus: "PROCESSED" }]
    };
  }

  return { finalStatus: status };
}

function buildSearchWhere(search: string): SessionWhereInput | undefined {
  const term = search.trim();

  if (!term) {
    return undefined;
  }

  return {
    OR: [
      { groupId: { contains: term, mode: "insensitive" } },
      { fellow: { name: { contains: term, mode: "insensitive" } } }
    ]
  };
}

function buildListWhere(supervisorId: string, query: SessionListQuery): SessionWhereInput {
  const where: SessionWhereInput = { supervisorId };
  const conditions: SessionWhereInput[] = [];
  const statusWhere = buildStatusWhere(query.status);
  const searchWhere = buildSearchWhere(query.search);

  if (statusWhere) {
    conditions.push(statusWhere);
  }

  if (searchWhere) {
    conditions.push(searchWhere);
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
}

export async function listForSupervisor(
  supervisorId: string,
  query: SessionListQuery
): Promise<SessionListResult> {
  const safePage = Math.max(1, query.page);
  const safePageSize = Math.max(1, query.pageSize);
  const where = buildListWhere(supervisorId, query);

  const sessionsPromise = prisma.session.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
    select: {
      id: true,
      groupId: true,
      occurredAt: true,
      finalStatus: true,
      fellow: {
        select: {
          name: true
        }
      }
    }
  }) as Promise<SessionListRow[]>;

  const totalCountPromise = prisma.session.count({ where });

  const [sessions, totalCount]: [SessionListRow[], number] = await Promise.all([
    sessionsPromise,
    totalCountPromise
  ]);

  return {
    items: sessions.map(
      (session: SessionListRow): SessionListItem => ({
        id: session.id,
        fellowName: session.fellow.name,
        occurredAt: session.occurredAt.toISOString(),
        groupId: session.groupId,
        displayStatus: deriveDisplayStatus(session.finalStatus)
      })
    ),
    page: safePage,
    pageSize: safePageSize,
    totalCount
  };
}

export async function getSessionMetricsForSupervisor(supervisorId: string): Promise<{
  riskCount: number;
  sessionsNeedingReview: number;
  reviewedToday: number;
  todayTotal: number;
}> {
  const sessions: SessionMetricRow[] = (await prisma.session.findMany({
    where: { supervisorId },
    select: {
      occurredAt: true,
      finalStatus: true
    }
  })) as SessionMetricRow[];

  let riskCount = 0;
  let sessionsNeedingReview = 0;
  let reviewedToday = 0;
  let todayTotal = 0;

  for (const session of sessions) {
    const status = deriveDisplayStatus(session.finalStatus);

    if (status === "RISK") {
      riskCount += 1;
    }

    if (status === "RISK" || status === "FLAGGED_FOR_REVIEW") {
      sessionsNeedingReview += 1;
    }

    if (dayjs(session.occurredAt).isSame(dayjs(), "day")) {
      todayTotal += 1;
      if (status !== "PROCESSED") {
        reviewedToday += 1;
      }
    }
  }

  return {
    riskCount,
    sessionsNeedingReview,
    reviewedToday,
    todayTotal
  };
}
