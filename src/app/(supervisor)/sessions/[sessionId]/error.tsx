"use client";

import { SessionDetailErrorState } from "@/features/sessions/components/SessionDetailErrorState";

interface SessionDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SessionDetailError({ error, reset }: SessionDetailErrorProps) {
  const safeMessage =
    process.env.NODE_ENV === "development"
      ? error.message || "Please refresh and try again."
      : "Something went wrong while loading this session.";

  return <SessionDetailErrorState message={safeMessage} onRetry={reset} />;
}
