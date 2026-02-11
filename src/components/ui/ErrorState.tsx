"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Unable to load this page",
  message = "Please try again in a moment.",
  onRetry
}: ErrorStateProps) {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Alert severity="error" sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        <Typography>{message}</Typography>
      </Alert>
      {onRetry ? (
        <Button variant="contained" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Stack>
  );
}
