import { Box, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireSupervisorSession } from "@/server/auth/session";

export default async function DashboardPage() {
  const session = await requireSupervisorSession();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Dashboard
            </Typography>
            <Typography color="text.secondary">
              Welcome back, {session.user.name ?? "Supervisor"}.
            </Typography>
          </Box>
          <SignOutButton />
        </Stack>

        <Card sx={{ backgroundColor: "common.white" }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Authentication is active</Typography>
            <Typography color="text.secondary">
              You are signed in as {session.user.email}.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
