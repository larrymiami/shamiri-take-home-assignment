"use client";

import { SessionDetailErrorState } from "@/features/sessions/components/SessionDetailErrorState";

interface SessionDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SessionDetailError({ error, reset }: SessionDetailErrorProps) {
  return (
    <SessionDetailErrorState
      message={error.message || "Please refresh and try again."}
      onRetry={reset}
    />
  );
}
