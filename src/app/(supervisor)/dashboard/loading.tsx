import { Stack } from "@mui/material";
import { DashboardMetricsSkeleton } from "@/features/dashboard/components/DashboardMetricsSkeleton";
import { SessionsTableSkeleton } from "@/features/sessions/components/SessionsTableSkeleton";

export default function DashboardLoading() {
  return (
    <Stack spacing={2.5}>
      <DashboardMetricsSkeleton />
      <SessionsTableSkeleton />
    </Stack>
  );
}
