"use client";

import Link from "next/link";
import dayjs from "dayjs";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Pagination,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import type { SessionStatus } from "@/server/types/domain";
import type { SessionListItem, SessionStatusFilter } from "@/features/sessions/types";
import { SessionStatusChip } from "@/features/sessions/components/SessionStatusChip";

interface SessionsTableProps {
  sessions: SessionListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  query: string;
  status: SessionStatusFilter;
}

function formatDate(occurredAtIso: string): string {
  return dayjs(occurredAtIso).format("MMM D, YYYY h:mm A");
}

function formatDateMobile(occurredAtIso: string): string {
  return dayjs(occurredAtIso).format("MMM D, YYYY");
}

function actionStyles(status: SessionStatus) {
  if (status === "RISK" || status === "FLAGGED_FOR_REVIEW") {
    return {
      variant: "contained" as const,
      label: "Review",
      sx: {
        backgroundColor: "secondary.main",
        color: "common.white",
        "&:hover": { backgroundColor: "secondary.dark" }
      }
    };
  }

  if (status === "SAFE") {
    return {
      variant: "outlined" as const,
      label: "Review",
      sx: {
        borderColor: "var(--shamiri-border-green)",
        color: "success.main",
        backgroundColor: "var(--shamiri-light-green)",
        "&:hover": {
          backgroundColor: "var(--shamiri-light-green)",
          borderColor: "success.main"
        }
      }
    };
  }

  if (status === "PROCESSED") {
    return {
      variant: "outlined" as const,
      label: "View",
      sx: {
        borderColor: "divider",
        color: "text.secondary",
        backgroundColor: "var(--shamiri-background-secondary)",
        "&:hover": {
          borderColor: "divider",
          backgroundColor: "var(--shamiri-background-secondary)"
        }
      }
    };
  }

  return {
    variant: "contained" as const,
    label: "Review",
    sx: {
      backgroundColor: "secondary.main",
      color: "common.white",
      "&:hover": { backgroundColor: "secondary.dark" }
    }
  };
}

function buildPageHref(page: number, query: string, status: SessionStatusFilter): string {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (status !== "ALL") {
    params.set("status", status);
  }

  params.set("page", String(page));

  return `/dashboard?${params.toString()}`;
}

export function SessionsTable({
  sessions,
  page,
  pageSize,
  totalCount,
  query,
  status
}: SessionsTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
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
                  name="q"
                  defaultValue={query}
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
                  name="status"
                  select
                  size="small"
                  defaultValue={status}
                  sx={{ minWidth: 160 }}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="ALL">Status: All</MenuItem>
                  <MenuItem value="RISK">Risk</MenuItem>
                  <MenuItem value="FLAGGED_FOR_REVIEW">Flagged</MenuItem>
                  <MenuItem value="SAFE">Safe</MenuItem>
                  <MenuItem value="PROCESSED">Processed</MenuItem>
                </TextField>
                <Button type="submit" variant="outlined">
                  Apply
                </Button>
              </Stack>
            </Box>
          </Stack>

          <Box sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
            <Table size="medium" aria-label="Completed sessions table">
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
                {sessions.map((session) => {
                  const action = actionStyles(session.displayStatus);
                  return (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography sx={{ fontWeight: 700 }}>{session.fellowName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tier 1 Fellow
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(session.occurredAt)}
                      </TableCell>
                      <TableCell>{session.groupId}</TableCell>
                      <TableCell>
                        <SessionStatusChip status={session.displayStatus} />
                      </TableCell>
                      <TableCell align="right">
                        <Link
                          href={`/sessions/${session.id}`}
                          style={{ textDecoration: "none", display: "inline-block" }}
                        >
                          <Button
                            variant={action.variant}
                            sx={{
                              minWidth: 96,
                              fontWeight: 800,
                              ...action.sx
                            }}
                          >
                            {action.label}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
            {sessions.map((session) => {
              const action = actionStyles(session.displayStatus);
              const actionButton = (
                <Button variant={action.variant} fullWidth sx={{ fontWeight: 800, ...action.sx }}>
                  {action.label}
                </Button>
              );

              return (
                <Card
                  key={session.id}
                  sx={{ borderRadius: 2, borderColor: "divider", backgroundColor: "common.white" }}
                >
                  <CardContent sx={{ p: 1.75 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.25}>
                          <Typography sx={{ fontWeight: 800 }}>{session.fellowName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Tier 1 Fellow
                          </Typography>
                        </Stack>
                        <SessionStatusChip status={session.displayStatus} />
                      </Stack>

                      <Stack direction="row" spacing={3}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              textTransform: "uppercase",
                              color: "text.disabled",
                              fontWeight: 800
                            }}
                          >
                            Date
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }}>
                            {formatDateMobile(session.occurredAt)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              textTransform: "uppercase",
                              color: "text.disabled",
                              fontWeight: 800
                            }}
                          >
                            Group ID
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }}>{session.groupId}</Typography>
                        </Box>
                      </Stack>

                      <Link
                        href={`/sessions/${session.id}`}
                        style={{ textDecoration: "none", display: "inline-block", width: "100%" }}
                      >
                        {actionButton}
                      </Link>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Stack spacing={1} alignItems="center">
            <Pagination
              count={totalPages}
              page={page}
              color="primary"
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              size="small"
              renderItem={(item) => {
                const targetPage = item.page ?? 1;
                return (
                  <PaginationItem
                    {...item}
                    component="a"
                    href={buildPageHref(targetPage, query, status)}
                  />
                );
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Showing {sessions.length} of {totalCount} sessions
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
