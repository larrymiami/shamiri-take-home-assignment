import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Grid } from "@mui/material";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { SessionsTable } from "@/features/sessions/components/SessionsTable";
import {
  getSessionMetricsForSupervisor,
  listForSupervisor
} from "@/features/sessions/server/sessions.repository";
import { countForSupervisor } from "@/server/repositories/fellows.repo";
import { parsePositiveInt, parseSessionStatusFilter } from "@/lib/searchParams";
import { requireSupervisorSession } from "@/server/auth/session";

const DEFAULT_PAGE_SIZE = 10;

interface DashboardPageProps {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    status?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireSupervisorSession();
  const params = searchParams ? await searchParams : {};
  const page = parsePositiveInt(params.page, 1);
  const search = params.q?.trim() ?? "";
  const status = parseSessionStatusFilter(params.status);
  const [sessionList, fellowsAssigned, metrics] = await Promise.all([
    listForSupervisor(session.user.id, {
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      search,
      status
    }),
    countForSupervisor(session.user.id),
    getSessionMetricsForSupervisor(session.user.id)
  ]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Flagged: Safety Risk"
            value={String(metrics.riskCount).padStart(2, "0")}
            emphasized
            icon={<WarningAmberRoundedIcon sx={{ color: "error.main", fontSize: 26 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Sessions Needing Review"
            value={String(metrics.sessionsNeedingReview).padStart(2, "0")}
            icon={<AssignmentLateOutlinedIcon sx={{ color: "warning.main", fontSize: 24 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Processed Today"
            value={`${metrics.reviewedToday} / ${metrics.todayTotal}`}
            subtitle={`${metrics.reviewedToday} reviewed · ${metrics.todayTotal} total`}
            icon={<TaskAltOutlinedIcon sx={{ color: "text.disabled", fontSize: 24 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Fellows Assigned"
            value={String(fellowsAssigned)}
            icon={<Groups2OutlinedIcon sx={{ color: "text.disabled", fontSize: 24 }} />}
          />
        </Grid>
      </Grid>

      {sessionList.totalCount === 0 ? (
        <EmptyState
          title="No completed sessions yet"
          description="Completed Fellow sessions will appear here once they are uploaded."
        />
      ) : (
        <SessionsTable
          sessions={sessionList.items}
          page={sessionList.page}
          pageSize={sessionList.pageSize}
          totalCount={sessionList.totalCount}
          query={search}
          status={status}
        />
      )}
    </>
  );
}
