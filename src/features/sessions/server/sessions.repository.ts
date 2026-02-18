import dayjs from "dayjs";
import type {
  SessionAnalysisDTO,
  SessionDetailDTO,
  SessionListItem,
  SessionListQuery,
  SessionListResult,
  SupervisorReviewInput
} from "@/features/sessions/types";
import { deriveSessionDisplayStatusFromSafetyFlag } from "@/features/sessions/utils/status";
import prisma from "@/server/db/prisma";
import { SessionAnalysisSchema } from "@/server/services/ai/schemas";
import type { SessionStatus } from "@/server/types/domain";

type SessionFindManyArgs = NonNullable<Parameters<typeof prisma.session.findMany>[0]>;
type SessionWhereInput = NonNullable<SessionFindManyArgs["where"]>;
type AnalysisUpsertArgs = NonNullable<Parameters<typeof prisma.aIAnalysis.upsert>[0]>;
type AnalysisResultJsonInput = AnalysisUpsertArgs["create"]["resultJson"];
type SessionListRow = {
  id: string;
  groupId: string;
  occurredAt: Date;
  finalStatus: SessionStatus | null;
  analysis: {
    safetyFlag: "SAFE" | "RISK";
    requiresSupervisorReview: boolean;
  } | null;
  fellow: {
    name: string;
  };
};
type SessionMetricRow = {
  occurredAt: Date;
  finalStatus: SessionStatus | null;
  analysis: {
    safetyFlag: "SAFE" | "RISK";
    requiresSupervisorReview: boolean;
  } | null;
  review: {
    id: string;
  } | null;
};

function normalizeLegacyRiskTriage(resultJson: unknown): unknown {
  if (typeof resultJson !== "object" || resultJson === null) {
    return resultJson;
  }

  const payload = resultJson as Record<string, unknown>;
  const riskDetectionRaw = payload["riskDetection"];

  if (typeof riskDetectionRaw !== "object" || riskDetectionRaw === null) {
    return resultJson;
  }

  const riskDetection = riskDetectionRaw as Record<string, unknown>;

  if (
    riskDetection["flag"] !== "RISK" ||
    Object.prototype.hasOwnProperty.call(riskDetection, "requiresSupervisorReview")
  ) {
    return resultJson;
  }

  return {
    ...payload,
    riskDetection: {
      ...riskDetection,
      // Backward compatibility for analyses persisted before this field existed.
      requiresSupervisorReview: true
    }
  };
}

function parseStoredAnalysis(resultJson: unknown): SessionAnalysisDTO | null {
  // Guard against historical/invalid JSON payloads in storage.
  const normalized = normalizeLegacyRiskTriage(resultJson);
  const parsed = SessionAnalysisSchema.safeParse(normalized);
  return parsed.success ? parsed.data : null;
}

function buildStatusWhere(status: SessionListQuery["status"]): SessionWhereInput | undefined {
  if (status === "ALL") {
    return undefined;
  }

  if (status === "PROCESSED") {
    // "Processed" means "not finalized by supervisor and no AI-derived SAFE/RISK yet".
    return {
      OR: [
        { finalStatus: "PROCESSED" },
        {
          AND: [{ finalStatus: null }, { analysis: { is: null } }]
        }
      ]
    };
  }

  if (status === "SAFE") {
    // Include AI SAFE when finalStatus is still pending human review.
    return {
      OR: [
        { finalStatus: "SAFE" },
        {
          AND: [
            { finalStatus: null },
            { analysis: { is: { safetyFlag: "SAFE", requiresSupervisorReview: false } } }
          ]
        }
      ]
    };
  }

  if (status === "RISK") {
    // Include AI RISK so risk filtering works before supervisor override.
    return {
      OR: [
        { finalStatus: "RISK" },
        {
          AND: [{ finalStatus: null }, { analysis: { is: { safetyFlag: "RISK" } } }]
        }
      ]
    };
  }

  return {
    OR: [
      { finalStatus: "FLAGGED_FOR_REVIEW" },
      {
        AND: [
          { finalStatus: null },
          { analysis: { is: { safetyFlag: "SAFE", requiresSupervisorReview: true } } }
        ]
      }
    ]
  };
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
  const statusSortPriority: Record<SessionStatus, number> = {
    RISK: 0,
    FLAGGED_FOR_REVIEW: 1,
    SAFE: 2,
    PROCESSED: 3
  };
  const safePage = Math.max(1, query.page);
  const safePageSize = Math.max(1, query.pageSize);
  const where = buildListWhere(supervisorId, query);
  const allSessions: SessionListRow[] = (await prisma.session.findMany({
    where,
    select: {
      id: true,
      groupId: true,
      occurredAt: true,
      finalStatus: true,
      analysis: {
        select: {
          safetyFlag: true,
          requiresSupervisorReview: true
        }
      },
      fellow: {
        select: {
          name: true
        }
      }
    }
  })) as SessionListRow[];
  const sortedItems: SessionListItem[] = allSessions
    .map(
      (session: SessionListRow): SessionListItem => ({
        id: session.id,
        fellowName: session.fellow.name,
        occurredAt: session.occurredAt.toISOString(),
        groupId: session.groupId,
        displayStatus: deriveSessionDisplayStatusFromSafetyFlag({
          finalStatus: session.finalStatus,
          analysisSafetyFlag: session.analysis?.safetyFlag ?? null,
          analysisRequiresSupervisorReview: session.analysis?.requiresSupervisorReview ?? null
        })
      })
    )
    .sort((left, right) => {
      const statusOrderDiff =
        statusSortPriority[left.displayStatus] - statusSortPriority[right.displayStatus];

      if (statusOrderDiff !== 0) {
        return statusOrderDiff;
      }

      return dayjs(right.occurredAt).valueOf() - dayjs(left.occurredAt).valueOf();
    });
  const totalCount = sortedItems.length;
  const offset = (safePage - 1) * safePageSize;
  const paginatedItems = sortedItems.slice(offset, offset + safePageSize);

  return {
    items: paginatedItems,
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
      finalStatus: true,
      review: {
        select: {
          id: true
        }
      },
      analysis: {
        select: {
          safetyFlag: true,
          requiresSupervisorReview: true
        }
      }
    }
  })) as SessionMetricRow[];

  let riskCount = 0;
  let sessionsNeedingReview = 0;
  let reviewedToday = 0;
  let todayTotal = 0;

  for (const session of sessions) {
    const status = deriveSessionDisplayStatusFromSafetyFlag({
      finalStatus: session.finalStatus,
      analysisSafetyFlag: session.analysis?.safetyFlag ?? null,
      analysisRequiresSupervisorReview: session.analysis?.requiresSupervisorReview ?? null
    });

    if (status === "RISK") {
      riskCount += 1;
    }

    if (status === "RISK" || status === "FLAGGED_FOR_REVIEW") {
      sessionsNeedingReview += 1;
    }

    if (dayjs(session.occurredAt).isSame(dayjs(), "day")) {
      todayTotal += 1;
      // "Reviewed" means a supervisor decision exists, not just a non-null finalStatus.
      if (session.review !== null) {
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

export async function getSessionSupervisorId(sessionId: string): Promise<string | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { supervisorId: true }
  });

  return session?.supervisorId ?? null;
}

export async function getSessionTranscriptById(
  sessionId: string
): Promise<{ id: string; transcriptText: string } | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, transcriptText: true }
  });

  return session
    ? {
        id: session.id,
        transcriptText: session.transcriptText
      }
    : null;
}

export async function getSessionAnalysisBySessionId(
  sessionId: string
): Promise<SessionAnalysisDTO | null> {
  const analysis = await prisma.aIAnalysis.findUnique({
    where: { sessionId },
    select: {
      resultJson: true
    }
  });

  if (!analysis) {
    return null;
  }

  return parseStoredAnalysis(analysis.resultJson);
}

export async function upsertSessionAnalysis(
  sessionId: string,
  analysis: SessionAnalysisDTO
): Promise<SessionAnalysisDTO> {
  // Idempotent persistence so repeated analyze calls do not duplicate rows.
  const saved = await prisma.aIAnalysis.upsert({
    where: { sessionId },
    create: {
      sessionId,
      resultJson: analysis as unknown as AnalysisResultJsonInput,
      safetyFlag: analysis.riskDetection.flag,
      riskQuotes: analysis.riskDetection.extractedQuotes,
      requiresSupervisorReview: analysis.riskDetection.requiresSupervisorReview,
      model: analysis.meta.model,
      promptVersion: analysis.meta.promptVersion,
      latencyMs: analysis.meta.latencyMs,
      transcriptCharsSent: analysis.meta.transcriptCharsSent,
      transcriptWasTruncated: analysis.meta.transcriptWasTruncated
    },
    update: {
      resultJson: analysis as unknown as AnalysisResultJsonInput,
      safetyFlag: analysis.riskDetection.flag,
      riskQuotes: analysis.riskDetection.extractedQuotes,
      requiresSupervisorReview: analysis.riskDetection.requiresSupervisorReview,
      model: analysis.meta.model,
      promptVersion: analysis.meta.promptVersion,
      latencyMs: analysis.meta.latencyMs,
      transcriptCharsSent: analysis.meta.transcriptCharsSent,
      transcriptWasTruncated: analysis.meta.transcriptWasTruncated
    },
    select: {
      resultJson: true
    }
  });

  const parsed = parseStoredAnalysis(saved.resultJson);

  if (!parsed) {
    throw new Error("Stored analysis payload failed contract validation");
  }

  return parsed;
}

export async function getSessionDetailForSupervisor(
  supervisorId: string,
  sessionId: string
): Promise<SessionDetailDTO | null> {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      supervisorId
    },
    select: {
      id: true,
      groupId: true,
      occurredAt: true,
      transcriptText: true,
      finalStatus: true,
      fellow: {
        select: {
          name: true
        }
      },
      analysis: {
        select: {
          resultJson: true
        }
      },
      review: {
        select: {
          decision: true,
          finalStatus: true,
          note: true,
          updatedAt: true
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  const analysis = session.analysis ? parseStoredAnalysis(session.analysis.resultJson) : null;

  return {
    id: session.id,
    fellowName: session.fellow.name,
    occurredAt: session.occurredAt.toISOString(),
    groupId: session.groupId,
    transcriptText: session.transcriptText,
    finalStatus: session.finalStatus,
    analysis: analysis ?? undefined,
    review: session.review
      ? {
          decision: session.review.decision,
          finalStatus: session.review.finalStatus,
          note: session.review.note,
          updatedAt: session.review.updatedAt.toISOString()
        }
      : undefined
  };
}

export async function submitSessionReview(params: {
  sessionId: string;
  supervisorId: string;
  payload: SupervisorReviewInput;
}): Promise<{
  decision: SupervisorReviewInput["decision"];
  finalStatus: SessionStatus;
  note: string;
  updatedAt: string;
}> {
  const { sessionId, supervisorId, payload } = params;

  // Keep Session.finalStatus and SupervisorReview atomically consistent.
  const [, review] = await prisma.$transaction([
    prisma.session.update({
      where: { id: sessionId },
      data: {
        finalStatus: payload.finalStatus
      },
      select: { id: true }
    }),
    prisma.supervisorReview.upsert({
      where: { sessionId },
      create: {
        sessionId,
        supervisorId,
        decision: payload.decision,
        finalStatus: payload.finalStatus,
        note: payload.note
      },
      update: {
        supervisorId,
        decision: payload.decision,
        finalStatus: payload.finalStatus,
        note: payload.note
      },
      select: {
        decision: true,
        finalStatus: true,
        note: true,
        updatedAt: true
      }
    })
  ]);

  return {
    decision: review.decision,
    finalStatus: review.finalStatus,
    note: review.note,
    updatedAt: review.updatedAt.toISOString()
  };
}
