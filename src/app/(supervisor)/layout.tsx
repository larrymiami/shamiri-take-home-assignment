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
      <Container maxWidth="xl">
        <a
          href="#supervisor-main-content"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            zIndex: 1400,
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#002244",
            border: "1px solid #e8e8e8",
            textDecoration: "none"
          }}
          className="skip-to-main-link"
        >
          Skip to main content
        </a>
      </Container>
      {/* Layout-level auth gate keeps all supervisor pages behind the same contract. */}
      <TopBar name={session.user.name ?? "Supervisor"} email={session.user.email ?? ""} />
      <Container
        id="supervisor-main-content"
        component="main"
        maxWidth="xl"
        sx={{ py: { xs: 2, md: 3 } }}
      >
        <Stack spacing={2.5}>{children}</Stack>
      </Container>
    </Stack>
  );
}
