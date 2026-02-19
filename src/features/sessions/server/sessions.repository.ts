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
type SessionListRawRow = {
  id: string;
  fellowName: string;
  groupId: string;
  occurredAt: Date | string;
  displayStatus: SessionStatus;
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

export async function listForSupervisor(
  supervisorId: string,
  query: SessionListQuery
): Promise<SessionListResult> {
  const safePage = Math.max(1, query.page);
  const safePageSize = Math.max(1, query.pageSize);
  const offset = (safePage - 1) * safePageSize;
  const searchTerm = query.search.trim();
  const escapedSearchTerm = searchTerm
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
  const searchPattern = `%${escapedSearchTerm}%`;
  const statusFilter = query.status;

  const countRows = await prisma.$queryRaw<Array<{ count: number }>>`
WITH base AS (
  SELECT
    s.id,
    CASE
      WHEN s."finalStatus" IS NOT NULL AND s."finalStatus" <> 'PROCESSED' THEN s."finalStatus"::text
      WHEN a."safetyFlag" = 'RISK' THEN 'RISK'
      WHEN a."safetyFlag" = 'SAFE' AND a."requiresSupervisorReview" = true THEN 'FLAGGED_FOR_REVIEW'
      WHEN a."safetyFlag" = 'SAFE' THEN 'SAFE'
      ELSE 'PROCESSED'
    END AS "displayStatus"
  FROM "Session" s
  INNER JOIN "Fellow" f ON f.id = s."fellowId"
  LEFT JOIN "AIAnalysis" a ON a."sessionId" = s.id
  WHERE s."supervisorId" = ${supervisorId}
    AND (
      ${searchTerm} = ''
      OR s."groupId" ILIKE ${searchPattern} ESCAPE '\'
      OR f."name" ILIKE ${searchPattern} ESCAPE '\'
    )
)
SELECT COUNT(*)::int AS "count"
FROM base
WHERE (${statusFilter} = 'ALL' OR "displayStatus" = ${statusFilter})
`;

  const [{ count: totalCount } = { count: 0 }] = countRows;

  if (totalCount === 0) {
    return {
      items: [],
      page: safePage,
      pageSize: safePageSize,
      totalCount: 0
    };
  }

  const rows = await prisma.$queryRaw<SessionListRawRow[]>`
WITH base AS (
  SELECT
    s.id,
    f."name" AS "fellowName",
    s."groupId",
    s."occurredAt",
    CASE
      WHEN s."finalStatus" IS NOT NULL AND s."finalStatus" <> 'PROCESSED' THEN s."finalStatus"::text
      WHEN a."safetyFlag" = 'RISK' THEN 'RISK'
      WHEN a."safetyFlag" = 'SAFE' AND a."requiresSupervisorReview" = true THEN 'FLAGGED_FOR_REVIEW'
      WHEN a."safetyFlag" = 'SAFE' THEN 'SAFE'
      ELSE 'PROCESSED'
    END AS "displayStatus"
  FROM "Session" s
  INNER JOIN "Fellow" f ON f.id = s."fellowId"
  LEFT JOIN "AIAnalysis" a ON a."sessionId" = s.id
  WHERE s."supervisorId" = ${supervisorId}
    AND (
      ${searchTerm} = ''
      OR s."groupId" ILIKE ${searchPattern} ESCAPE '\'
      OR f."name" ILIKE ${searchPattern} ESCAPE '\'
    )
)
SELECT
  id,
  "fellowName",
  "groupId",
  "occurredAt",
  "displayStatus"
FROM base
WHERE (${statusFilter} = 'ALL' OR "displayStatus" = ${statusFilter})
ORDER BY
  CASE "displayStatus"
    WHEN 'RISK' THEN 0
    WHEN 'FLAGGED_FOR_REVIEW' THEN 1
    WHEN 'SAFE' THEN 2
    ELSE 3
  END,
  "occurredAt" DESC
LIMIT ${safePageSize}
OFFSET ${offset}
`;

  const items: SessionListItem[] = rows.map((row) => ({
    id: row.id,
    fellowName: row.fellowName,
    occurredAt:
      row.occurredAt instanceof Date
        ? row.occurredAt.toISOString()
        : new Date(row.occurredAt).toISOString(),
    groupId: row.groupId,
    displayStatus: row.displayStatus
  }));

  return {
    items,
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
  const pendingFinalStatusWhere: SessionWhereInput = {
    OR: [{ finalStatus: null }, { finalStatus: "PROCESSED" }]
  };
  const todayStart = dayjs().startOf("day").toDate();
  const todayEndExclusive = dayjs().add(1, "day").startOf("day").toDate();

  const [riskCount, sessionsNeedingReview, reviewedToday, todayTotal] = await Promise.all([
    prisma.session.count({
      where: {
        supervisorId,
        OR: [
          { finalStatus: "RISK" },
          {
            AND: [pendingFinalStatusWhere, { analysis: { is: { safetyFlag: "RISK" } } }]
          }
        ]
      }
    }),
    prisma.session.count({
      where: {
        supervisorId,
        OR: [
          { finalStatus: "RISK" },
          { finalStatus: "FLAGGED_FOR_REVIEW" },
          {
            AND: [pendingFinalStatusWhere, { analysis: { is: { safetyFlag: "RISK" } } }]
          },
          {
            AND: [
              pendingFinalStatusWhere,
              { analysis: { is: { safetyFlag: "SAFE", requiresSupervisorReview: true } } }
            ]
          }
        ]
      }
    }),
    prisma.supervisorReview.count({
      where: {
        supervisorId,
        session: {
          supervisorId,
          occurredAt: {
            gte: todayStart,
            lt: todayEndExclusive
          }
        }
      }
    }),
    prisma.session.count({
      where: {
        supervisorId,
        occurredAt: {
          gte: todayStart,
          lt: todayEndExclusive
        }
      }
    })
  ]);

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

export async function canSupervisorAccessSession(
  supervisorId: string,
  sessionId: string
): Promise<boolean> {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      supervisorId
    },
    select: {
      id: true
    }
  });

  return Boolean(session);
}

export async function getSessionHeaderForSupervisor(
  supervisorId: string,
  sessionId: string
): Promise<{
  id: string;
  fellowName: string;
  occurredAt: string;
  groupId: string;
  finalStatus: SessionStatus | null;
  displayStatus: SessionStatus;
} | null> {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      supervisorId
    },
    select: {
      id: true,
      groupId: true,
      occurredAt: true,
      finalStatus: true,
      fellow: {
        select: {
          name: true
        }
      },
      analysis: {
        select: {
          safetyFlag: true,
          requiresSupervisorReview: true
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    fellowName: session.fellow.name,
    occurredAt: session.occurredAt.toISOString(),
    groupId: session.groupId,
    finalStatus: session.finalStatus,
    displayStatus: deriveSessionDisplayStatusFromSafetyFlag({
      finalStatus: session.finalStatus,
      analysisSafetyFlag: session.analysis?.safetyFlag ?? null,
      analysisRequiresSupervisorReview: session.analysis?.requiresSupervisorReview ?? null
    })
  };
}

export async function getSessionTranscriptForSupervisor(
  supervisorId: string,
  sessionId: string
): Promise<{
  transcriptText: string;
  highlightedQuotes: string[];
} | null> {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      supervisorId
    },
    select: {
      transcriptText: true,
      analysis: {
        select: {
          resultJson: true
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  const analysis = session.analysis ? parseStoredAnalysis(session.analysis.resultJson) : null;

  return {
    transcriptText: session.transcriptText,
    highlightedQuotes: analysis?.riskDetection.extractedQuotes ?? []
  };
}

export async function getSessionInsightsForSupervisor(
  supervisorId: string,
  sessionId: string
): Promise<{
  id: string;
  finalStatus: SessionStatus | null;
  displayStatus: SessionStatus;
  analysis?: SessionAnalysisDTO;
  review?: SessionDetailDTO["review"];
} | null> {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      supervisorId
    },
    select: {
      id: true,
      finalStatus: true,
      analysis: {
        select: {
          resultJson: true,
          safetyFlag: true,
          requiresSupervisorReview: true
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

  const parsedAnalysis = session.analysis ? parseStoredAnalysis(session.analysis.resultJson) : null;

  return {
    id: session.id,
    finalStatus: session.finalStatus,
    displayStatus: deriveSessionDisplayStatusFromSafetyFlag({
      finalStatus: session.finalStatus,
      analysisSafetyFlag: session.analysis?.safetyFlag ?? null,
      analysisRequiresSupervisorReview: session.analysis?.requiresSupervisorReview ?? null
    }),
    analysis: parsedAnalysis ?? undefined,
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
