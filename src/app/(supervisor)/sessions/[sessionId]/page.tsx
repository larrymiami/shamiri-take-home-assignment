import { notFound } from "next/navigation";
import { SessionDetailView } from "@/features/sessions/components/SessionDetailView";
import { canSupervisorAccessSession } from "@/features/sessions/server/sessions.repository";
import { requireSupervisorSession } from "@/server/auth/session";

interface SessionDetailPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const authSession = await requireSupervisorSession();
  const { sessionId } = await params;
  const hasSessionAccess = await canSupervisorAccessSession(authSession.user.id, sessionId);

  if (!hasSessionAccess) {
    notFound();
  }

  return <SessionDetailView sessionId={sessionId} supervisorId={authSession.user.id} />;
}
