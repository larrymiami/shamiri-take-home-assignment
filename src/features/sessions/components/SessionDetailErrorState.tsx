"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography
} from "@mui/material";

interface SessionDetailErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function SessionDetailErrorState({ message, onRetry }: SessionDetailErrorStateProps) {
  return (
    <Grid container spacing={2.5} alignItems="flex-start">
      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={1.5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={0.8}>
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography component="h1" variant="h3">
                    Session Review
                  </Typography>
                  <Chip
                    icon={<ErrorOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                    label="Unavailable"
                    sx={{
                      backgroundColor: "error.light",
                      color: "error.main",
                      border: "1px solid",
                      borderColor: "var(--shamiri-red-border)",
                      fontWeight: 700
                    }}
                  />
                </Stack>
                <Typography color="text.secondary">
                  We couldn&apos;t load this session detail right now.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                  Full Transcript
                </Typography>
                <Typography color="text.disabled" variant="body2">
                  unavailable
                </Typography>
              </Stack>
              <Divider />
              <Box sx={{ px: 2.5, py: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  Transcript data could not be retrieved.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={1.5}>
          <Card sx={{ borderRadius: 3, backgroundColor: "var(--shamiri-brand-lighter-blue)" }}>
            <CardContent sx={{ p: 2.25 }}>
              <Stack spacing={1}>
                <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                  Could not load session insights
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {message || "Please try again in a moment."}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, borderColor: "primary.main", borderWidth: 2 }}>
            <CardContent sx={{ p: 2.25 }}>
              <Stack spacing={1.25}>
                <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                  Recovery Actions
                </Typography>
                <Button
                  variant="contained"
                  onClick={onRetry}
                  startIcon={<RefreshRoundedIcon />}
                  fullWidth
                >
                  Retry Loading Session
                </Button>
                <Button
                  variant="outlined"
                  href="/dashboard"
                  startIcon={<ArrowBackOutlinedIcon />}
                  fullWidth
                >
                  Back to Dashboard
                </Button>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  If this keeps happening, return to the dashboard and open a different session to
                  continue review while this one retries.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}
