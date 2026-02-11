import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Grid } from "@mui/material";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SessionsTable } from "@/components/sessions/SessionsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireSupervisorSession } from "@/server/auth/session";
import { countForSupervisor } from "@/server/repositories/fellows.repo";
import {
  getSessionMetricsForSupervisor,
  listForSupervisor
} from "@/server/repositories/sessions.repo";
import { SESSION_STATUS_VALUES } from "@/server/types/domain";
import type { SessionStatusFilter } from "@/server/types/sessions";

const DEFAULT_PAGE_SIZE = 10;

interface DashboardPageProps {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    status?: string;
  }>;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

function parseStatusFilter(status: string | undefined): SessionStatusFilter {
  if (!status || status === "ALL") {
    return "ALL";
  }

  if (SESSION_STATUS_VALUES.includes(status as (typeof SESSION_STATUS_VALUES)[number])) {
    return status as SessionStatusFilter;
  }

  return "ALL";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireSupervisorSession();
  const params = searchParams ? await searchParams : {};
  const page = parsePositiveInt(params.page, 1);
  const search = params.q?.trim() ?? "";
  const status = parseStatusFilter(params.status);

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
            icon={<AssignmentLateOutlinedIcon sx={{ color: "#d9b2b2", fontSize: 24 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Processed Today"
            value={`${metrics.reviewedToday} / ${metrics.todayTotal}`}
            subtitle={`${metrics.reviewedToday} reviewed · ${metrics.todayTotal} total`}
            icon={<TaskAltOutlinedIcon sx={{ color: "#c9cfdf", fontSize: 24 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Fellows Assigned"
            value={String(fellowsAssigned)}
            icon={<Groups2OutlinedIcon sx={{ color: "#c9cfdf", fontSize: 24 }} />}
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
