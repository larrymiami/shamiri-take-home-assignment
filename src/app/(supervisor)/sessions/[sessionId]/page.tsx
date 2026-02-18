import { notFound } from "next/navigation";
import { SessionDetailView } from "@/features/sessions/components/SessionDetailView";
import { getSessionDetailForSupervisor } from "@/features/sessions/server/sessions.repository";
import { requireSupervisorSession } from "@/server/auth/session";

interface SessionDetailPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const authSession = await requireSupervisorSession();
  const { sessionId } = await params;
  // Repository fetch is already scoped by supervisor to enforce ownership.
  const detail = await getSessionDetailForSupervisor(authSession.user.id, sessionId);

  if (!detail) {
    notFound();
  }

  return <SessionDetailView session={detail} />;
}
