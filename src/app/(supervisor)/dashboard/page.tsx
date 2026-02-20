import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Grid } from "@mui/material";
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
  // Fetch independent dashboard slices in parallel to minimize TTFB.
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
  const reviewedTodaySubtitle =
    metrics.todayTotal === 0
      ? "No sessions recorded today"
      : `${metrics.reviewedToday} of ${metrics.todayTotal} sessions reviewed today`;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Flagged: Safety Risk"
            value={String(metrics.riskCount)}
            emphasized
            icon={<WarningAmberRoundedIcon sx={{ color: "error.main", fontSize: 26 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Sessions Needing Review"
            value={String(metrics.sessionsNeedingReview)}
            icon={<AssignmentLateOutlinedIcon sx={{ color: "warning.main", fontSize: 24 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Review Progress Today"
            value={`${metrics.reviewedToday} / ${metrics.todayTotal}`}
            subtitle={reviewedTodaySubtitle}
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

      <SessionsTable
        sessions={sessionList.items}
        page={sessionList.page}
        pageSize={sessionList.pageSize}
        totalCount={sessionList.totalCount}
        query={search}
        status={status}
      />
    </>
  );
}
