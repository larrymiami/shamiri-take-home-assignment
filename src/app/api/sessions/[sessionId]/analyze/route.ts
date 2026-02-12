import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getSessionAnalysisBySessionId,
  getSessionSupervisorId,
  getSessionTranscriptById,
  upsertSessionAnalysis
} from "@/features/sessions/server/sessions.repository";
import { getCurrentSession } from "@/server/auth/session";
import { AIOutputValidationError, analyzeSession } from "@/server/services/ai/analyzeSession";

interface AnalyzeRouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function POST(_request: Request, context: AnalyzeRouteContext) {
  const authSession = await getCurrentSession();

  if (!authSession?.user?.id || authSession.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const supervisorIdForSession = await getSessionSupervisorId(sessionId);

  if (!supervisorIdForSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (supervisorIdForSession !== authSession.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingAnalysis = await getSessionAnalysisBySessionId(sessionId);

  if (existingAnalysis) {
    return NextResponse.json(existingAnalysis);
  }

  const session = await getSessionTranscriptById(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const analysis = await analyzeSession(session.transcriptText);
    const savedAnalysis = await upsertSessionAnalysis(sessionId, analysis);

    revalidatePath("/dashboard");
    revalidatePath(`/sessions/${sessionId}`);

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    if (error instanceof AIOutputValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    console.error("Failed to analyze session", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
