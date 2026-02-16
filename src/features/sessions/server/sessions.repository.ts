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
  } | null;
};

function parseStoredAnalysis(resultJson: unknown): SessionAnalysisDTO | null {
  const parsed = SessionAnalysisSchema.safeParse(resultJson);
  return parsed.success ? parsed.data : null;
}

function buildStatusWhere(status: SessionListQuery["status"]): SessionWhereInput | undefined {
  if (status === "ALL") {
    return undefined;
  }

  if (status === "PROCESSED") {
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
    return {
      OR: [
        { finalStatus: "SAFE" },
        {
          AND: [{ finalStatus: null }, { analysis: { is: { safetyFlag: "SAFE" } } }]
        }
      ]
    };
  }

  if (status === "RISK") {
    return {
      OR: [
        { finalStatus: "RISK" },
        {
          AND: [{ finalStatus: null }, { analysis: { is: { safetyFlag: "RISK" } } }]
        }
      ]
    };
  }

  return { finalStatus: "FLAGGED_FOR_REVIEW" };
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
      analysis: {
        select: {
          safetyFlag: true
        }
      },
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
        displayStatus: deriveSessionDisplayStatusFromSafetyFlag({
          finalStatus: session.finalStatus,
          analysisSafetyFlag: session.analysis?.safetyFlag ?? null
        })
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
      finalStatus: true,
      analysis: {
        select: {
          safetyFlag: true
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
      analysisSafetyFlag: session.analysis?.safetyFlag ?? null
    });

    if (status === "RISK") {
      riskCount += 1;
    }

    if (status === "RISK" || status === "FLAGGED_FOR_REVIEW") {
      sessionsNeedingReview += 1;
    }

    if (dayjs(session.occurredAt).isSame(dayjs(), "day")) {
      todayTotal += 1;
      if (session.finalStatus !== null) {
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
  const saved = await prisma.aIAnalysis.upsert({
    where: { sessionId },
    create: {
      sessionId,
      resultJson: analysis as unknown as AnalysisResultJsonInput,
      safetyFlag: analysis.riskDetection.flag,
      riskQuotes: analysis.riskDetection.extractedQuotes,
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
