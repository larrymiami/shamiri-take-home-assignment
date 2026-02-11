"use client";

import { Container } from "@mui/material";
import { ErrorState } from "@/components/ui/ErrorState";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 1, md: 2 } }}>
      <ErrorState
        title="Could not load supervisor dashboard"
        message={error.message || "Please try refreshing the page."}
        onRetry={reset}
      />
    </Container>
  );
}
