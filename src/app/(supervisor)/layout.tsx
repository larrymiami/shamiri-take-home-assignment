import { Container, Stack } from "@mui/material";
import { TopBar } from "@/components/layout/TopBar";
import { requireSupervisorSession } from "@/server/auth/session";

interface SupervisorLayoutProps {
  children: React.ReactNode;
}

export default async function SupervisorLayout({ children }: SupervisorLayoutProps) {
  const session = await requireSupervisorSession();

  return (
    <Stack spacing={0}>
      <TopBar name={session.user.name ?? "Supervisor"} email={session.user.email ?? ""} />
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>{children}</Stack>
      </Container>
    </Stack>
  );
}
