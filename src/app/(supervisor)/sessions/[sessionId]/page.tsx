import { Typography } from "@mui/material";
import { requireSupervisorSession } from "@/server/auth/session";

interface SessionDetailPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  await requireSupervisorSession();
  const { sessionId } = await params;

  return (
    <>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Session Detail
      </Typography>
      <Typography color="text.secondary">
        Session <strong>{sessionId}</strong> detail view is coming next.
      </Typography>
    </>
  );
}
