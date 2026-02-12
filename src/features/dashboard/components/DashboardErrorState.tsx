"use client";

import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { MetricCard } from "@/features/dashboard/components/MetricCard";

interface DashboardErrorStateProps {
  message: string;
  onRetry: () => void;
}

function unavailableValue() {
  return (
    <Typography sx={{ fontSize: 22, lineHeight: 1, fontWeight: 800, color: "text.disabled" }}>
      Unavailable
    </Typography>
  );
}

export function DashboardErrorState({ message, onRetry }: DashboardErrorStateProps) {
  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Flagged: Safety Risk"
            value={unavailableValue()}
            emphasized
            icon={<WarningAmberRoundedIcon sx={{ color: "error.main", fontSize: 26 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Sessions Needing Review"
            value={unavailableValue()}
            icon={<AssignmentLateOutlinedIcon sx={{ color: "#d9b2b2", fontSize: 24 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Processed Today"
            value={unavailableValue()}
            subtitle={
              <Typography color="text.disabled" sx={{ fontSize: 13, fontWeight: 600 }}>
                Awaiting reload
              </Typography>
            }
            icon={<TaskAltOutlinedIcon sx={{ color: "#c9cfdf", fontSize: 24 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Fellows Assigned"
            value={unavailableValue()}
            icon={<Groups2OutlinedIcon sx={{ color: "#c9cfdf", fontSize: 24 }} />}
          />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, backgroundColor: "common.white" }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h4" sx={{ fontSize: 28, fontWeight: 800, mb: 0.5 }}>
                  Completed Sessions
                </Typography>
                <Typography color="text.secondary">
                  Review completed Fellow sessions to ensure safety and protocol fidelity.
                </Typography>
              </Box>

              <Box component="form" action="/dashboard">
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    disabled
                    name="q"
                    placeholder="Filter by Fellow or Group ID"
                    size="small"
                    sx={{ minWidth: { sm: 260 } }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment key="search-start-adornment" position="start">
                            <SearchOutlinedIcon fontSize="small" color="disabled" />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                  <TextField
                    disabled
                    name="status"
                    select
                    size="small"
                    value="ALL"
                    sx={{ minWidth: 160 }}
                    slotProps={{ select: { displayEmpty: true } }}
                  >
                    <MenuItem value="ALL">Status: All</MenuItem>
                  </TextField>
                  <Button type="submit" variant="outlined" disabled>
                    Apply
                  </Button>
                </Stack>
              </Box>
            </Stack>

            <Box sx={{ overflowX: "auto" }}>
              <Table size="medium" aria-label="Completed sessions error table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                    >
                      Fellow
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                    >
                      Group ID
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert
                        severity="error"
                        action={
                          <Button color="inherit" size="small" onClick={onRetry}>
                            Retry
                          </Button>
                        }
                      >
                        Could not load dashboard data. {message}
                      </Alert>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
