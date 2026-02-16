import { NextResponse } from "next/server";
import {
  getSessionDetailForSupervisor,
  getSessionSupervisorId
} from "@/features/sessions/server/sessions.repository";
import { getCurrentSession } from "@/server/auth/session";

interface SessionRouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function GET(_request: Request, context: SessionRouteContext) {
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

  const detail = await getSessionDetailForSupervisor(authSession.user.id, sessionId);

  if (!detail) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
