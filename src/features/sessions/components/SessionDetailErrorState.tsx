"use client";

import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { ErrorState } from "@/components/ui/ErrorState";

interface SessionDetailErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function SessionDetailErrorState({ message, onRetry }: SessionDetailErrorStateProps) {
  return (
    <Stack spacing={2.5}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={0.5}>
            <Typography component="h1" variant="h3">
              Session Review
            </Typography>
            <Typography color="text.secondary">The session detail could not be loaded.</Typography>
          </Stack>
        </CardContent>
      </Card>
      <ErrorState
        title="Could not load session insights"
        message={message || "Please try reloading this page."}
        onRetry={onRetry}
      />
      <Button variant="outlined" href="/dashboard" sx={{ alignSelf: "flex-start" }}>
        Back to Dashboard
      </Button>
    </Stack>
  );
}
