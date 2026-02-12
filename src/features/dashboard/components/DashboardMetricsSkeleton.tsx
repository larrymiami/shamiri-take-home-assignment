import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Grid, Skeleton } from "@mui/material";
import { MetricCard } from "@/features/dashboard/components/MetricCard";

function valueSkeleton(width: number) {
  return <Skeleton variant="text" width={width} height={56} sx={{ transform: "none" }} />;
}

export function DashboardMetricsSkeleton() {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title="Flagged: Safety Risk"
          value={valueSkeleton(56)}
          emphasized
          icon={<WarningAmberRoundedIcon sx={{ color: "error.main", fontSize: 26 }} />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title="Sessions Needing Review"
          value={valueSkeleton(56)}
          icon={<AssignmentLateOutlinedIcon sx={{ color: "#d9b2b2", fontSize: 24 }} />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title="Processed Today"
          value={valueSkeleton(92)}
          subtitle={<Skeleton variant="text" width={160} sx={{ transform: "none" }} />}
          icon={<TaskAltOutlinedIcon sx={{ color: "#c9cfdf", fontSize: 24 }} />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title="Fellows Assigned"
          value={valueSkeleton(56)}
          icon={<Groups2OutlinedIcon sx={{ color: "#c9cfdf", fontSize: 24 }} />}
        />
      </Grid>
    </Grid>
  );
}
