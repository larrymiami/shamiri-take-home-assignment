"use client";

import { DashboardErrorState } from "@/features/dashboard/components/DashboardErrorState";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <DashboardErrorState
      message={error.message || "Please try refreshing the page."}
      onRetry={reset}
    />
  );
}
