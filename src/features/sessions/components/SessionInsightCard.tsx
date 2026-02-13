"use client";

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import type { SessionAnalysisDTO } from "@/features/sessions/types";

interface SessionInsightCardProps {
  sessionId: string;
  analysis?: SessionAnalysisDTO;
}

export function SessionInsightCard({ sessionId, analysis }: SessionInsightCardProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
              No AI analysis is available for this session yet.
            </Alert>
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
            <Button disabled={isAnalyzing} onClick={handleAnalyze} variant="contained">
              {isAnalyzing ? "Generating..." : "Generate Analysis"}
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
