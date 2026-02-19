"use client";

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import type { SessionAnalysisDTO } from "@/features/sessions/types";
import type { SessionStatus } from "@/server/types/domain";

interface SessionInsightCardProps {
  sessionId: string;
  analysis?: SessionAnalysisDTO;
  finalStatus?: SessionStatus | null;
  hasReview?: boolean;
}

function AnalysisLoadingPreview() {
  const loadingMetricRows = [
    { title: "Growth Mindset", rating: "PARTIAL" },
    { title: "Facilitation Quality", rating: "ADEQUATE" },
    { title: "Protocol Safety", rating: "ADHERENT" }
  ] as const;

  return (
    <Stack spacing={1.5}>
      <Box sx={{ px: 0.25 }}>
        <Stack spacing={0.35}>
          <Skeleton variant="text" width="98%" sx={{ fontSize: "0.85rem" }} />
          <Skeleton variant="text" width="95%" sx={{ fontSize: "0.85rem" }} />
          <Skeleton variant="text" width="84%" sx={{ fontSize: "0.85rem" }} />
        </Stack>
      </Box>

      {loadingMetricRows.map((metric) => (
        <Card key={metric.title} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform: "uppercase",
                    color: "text.secondary"
                  }}
                >
                  {metric.title}
                </Typography>
                <Chip
                  size="small"
                  icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                  label={`--/3 ${metric.rating}`}
                  sx={{
                    color: "success.main",
                    backgroundColor: "var(--shamiri-light-green)",
                    border: "1px solid",
                    borderColor: "var(--shamiri-border-green)",
                    fontWeight: 700
                  }}
                />
              </Stack>
              <Skeleton variant="text" width="95%" sx={{ fontSize: "0.9rem" }} />
              <Skeleton variant="text" width="88%" sx={{ fontSize: "0.9rem" }} />
              <Stack spacing={0.45}>
                <Skeleton variant="text" width="72%" sx={{ fontSize: "0.75rem" }} />
                <Skeleton variant="text" width="64%" sx={{ fontSize: "0.75rem" }} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Alert
        icon={false}
        severity="warning"
        sx={{
          borderRadius: 3,
          borderColor: "#f2cfab",
          backgroundColor: "#fff7ee",
          "& .MuiAlert-message": {
            width: "100%"
          }
        }}
      >
        <Stack spacing={1.1}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <WarningAmberRoundedIcon fontSize="small" sx={{ color: "#995200" }} />
            <Typography
              sx={{
                fontWeight: 900,
                color: "#995200",
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}
            >
              Safety Classification In Progress
            </Typography>
          </Stack>
          <Box
            sx={{
              px: 1.25,
              py: 1,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "#f2cfab",
              backgroundColor: "common.white"
            }}
          >
            <Skeleton variant="text" width="90%" sx={{ fontSize: "0.8rem" }} />
          </Box>
          <Typography variant="body2" sx={{ color: "#8b5e2f" }}>
            Reviewing transcript for explicit risk indicators and supporting evidence quotes.
          </Typography>
          <Chip
            size="small"
            icon={<WarningAmberRoundedIcon sx={{ fontSize: 16 }} />}
            label="Supervisor recommendation pending"
            sx={{
              alignSelf: "flex-start",
              backgroundColor: "#ffe9d1",
              color: "#8f4c00",
              border: "1px solid",
              borderColor: "#f2cfab",
              fontWeight: 700,
              px: 1,
              py: 2,
              "& .MuiChip-icon": {
                color: "inherit",
                ml: 0.5
              }
            }}
          />
        </Stack>
      </Alert>
    </Stack>
  );
}

export function SessionInsightCard({
  sessionId,
  analysis,
  finalStatus,
  hasReview = false
}: SessionInsightCardProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // If human review already exists, status should be interpreted as human-owned even without AI.
  const hasHumanStatus = Boolean(finalStatus || hasReview);

  const handleAnalyze = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/analyze`, {
        method: "POST"
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setErrorMessage(data?.error ?? "Could not generate analysis.");
        return;
      }

      setSuccessMessage("Analysis generated successfully.");
      router.refresh();
    } catch {
      setErrorMessage("Network error while generating analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysis) {
    return (
      <Card sx={{ borderRadius: 3, backgroundColor: "var(--shamiri-brand-lighter-blue)" }}>
        <CardContent sx={{ p: 2.25 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
              <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                AI-Generated Session Analysis
              </Typography>
            </Stack>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {hasHumanStatus
                ? "Session status is currently based on supervisor review/final status. AI analysis is not available yet."
                : "No AI analysis is available for this session yet."}
            </Alert>
            {isAnalyzing ? <AnalysisLoadingPreview /> : null}
            {errorMessage ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            ) : null}
            {successMessage ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {successMessage}
              </Alert>
            ) : null}
            <Button
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              variant="contained"
              startIcon={isAnalyzing ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isAnalyzing ? "Generating Analysis..." : "Generate Analysis"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, backgroundColor: "info.light", borderColor: "info.light" }}>
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.8}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
            <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
              AI-Generated Session Analysis
            </Typography>
          </Stack>

          <Box sx={{ px: 0.25 }}>
            <Typography
              sx={{
                fontStyle: "italic",
                color: "text.primary",
                lineHeight: 1.6,
                fontSize: "0.85rem"
              }}
            >
              {analysis.sessionSummary}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
