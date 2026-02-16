import Link from "next/link";
import dayjs from "dayjs";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Box, Breadcrumbs, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import { ReviewPanel } from "@/features/sessions/components/ReviewPanel";
import { RiskBanner } from "@/features/sessions/components/RiskBanner";
import { SessionInsightCard } from "@/features/sessions/components/SessionInsightCard";
import { SessionRubricCards } from "@/features/sessions/components/SessionRubricCards";
import { SessionStatusChip } from "@/features/sessions/components/SessionStatusChip";
import { TranscriptPanel } from "@/features/sessions/components/TranscriptPanel";
import type { SessionDetailDTO } from "@/features/sessions/types";
import { deriveSessionDisplayStatus } from "@/features/sessions/utils/status";

interface SessionDetailViewProps {
  session: SessionDetailDTO;
}

function estimateSessionDuration(transcriptText: string): string {
  const words = transcriptText.trim().split(/\s+/).length;
  const minutes = Math.max(20, Math.min(60, Math.round(words / 2.3)));
  return `${minutes}m`;
}

export function SessionDetailView({ session }: SessionDetailViewProps) {
  const displayStatus = deriveSessionDisplayStatus({
    finalStatus: session.finalStatus ?? null,
    analysis: session.analysis
  });
  const isRisk = session.analysis?.riskDetection.flag === "RISK";

  return (
    <Grid container spacing={2.5} alignItems="flex-start">
      <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 2, lg: 1 } }}>
        <Stack spacing={1.5}>
          <Stack spacing={0.8}>
            <Breadcrumbs
              separator={<NavigateNextRoundedIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>
                <Typography variant="body2" color="text.secondary">
                  Sessions
                </Typography>
              </Link>
              <Typography variant="body2" color="text.secondary">
                Audit Log
              </Typography>
            </Breadcrumbs>

            <Stack spacing={0.6}>
              <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography component="h1" variant="h4">
                  Session Review
                </Typography>
                <SessionStatusChip status={displayStatus} size="medium" prominent />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography sx={{ fontWeight: 700 }}>{session.fellowName}</Typography>
                <Typography color="text.disabled">•</Typography>
                <Typography color="text.secondary">
                  {dayjs(session.occurredAt).format("MMM D, YYYY")}
                </Typography>
                <Typography color="text.disabled">•</Typography>
                <Typography
                  sx={{
                    px: 1,
                    py: 0.15,
                    borderRadius: 999,
                    backgroundColor: "var(--shamiri-background-secondary)",
                    color: "text.secondary",
                    fontWeight: 700,
                    fontSize: 13
                  }}
                >
                  {session.groupId}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />}
              label={`Duration ${estimateSessionDuration(session.transcriptText)}`}
              variant="outlined"
              sx={{ borderColor: "divider", fontWeight: 700, backgroundColor: "common.white" }}
            />
            <Chip
              icon={<LayersOutlinedIcon sx={{ fontSize: 16 }} />}
              label="Tier 1"
              variant="outlined"
              sx={{ borderColor: "divider", fontWeight: 700, backgroundColor: "common.white" }}
            />
            <Chip
              icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
              label="Transcript Ready"
              sx={{
                fontWeight: 700,
                backgroundColor: "var(--shamiri-light-green)",
                color: "success.main",
                border: "1px solid",
                borderColor: "var(--shamiri-border-green)"
              }}
            />
          </Stack>

          <Box id="transcript-panel" sx={{ scrollMarginTop: { xs: 72, lg: 92 } }}>
            <TranscriptPanel
              transcriptText={session.transcriptText}
              highlightedQuotes={session.analysis?.riskDetection.extractedQuotes}
            />
          </Box>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 1, lg: 2 } }}>
        <Box sx={{ position: { lg: "sticky" }, top: { lg: 84 } }}>
          <Stack spacing={1.5}>
            <Button
              href="#transcript-panel"
              variant="outlined"
              size="small"
              startIcon={<ArrowDownwardRoundedIcon />}
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
                display: { xs: "inline-flex", lg: "none" }
              }}
            >
              Jump to Transcript
            </Button>
            <SessionInsightCard
              sessionId={session.id}
              analysis={session.analysis}
              finalStatus={session.finalStatus}
              hasReview={Boolean(session.review)}
            />
            {session.analysis ? (
              <RiskBanner
                flag={session.analysis.riskDetection.flag}
                quotes={session.analysis.riskDetection.extractedQuotes}
                rationale={session.analysis.riskDetection.rationale}
              />
            ) : null}
            {!session.analysis && displayStatus === "RISK" ? (
              <RiskBanner
                flag="RISK"
                rationale="Session status indicates elevated risk. Generate analysis for extracted evidence."
              />
            ) : null}
            {session.analysis ? <SessionRubricCards analysis={session.analysis} /> : null}
            <ReviewPanel
              sessionId={session.id}
              currentStatus={displayStatus}
              hasAnalysis={Boolean(session.analysis)}
              existingReview={session.review}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ alignSelf: "flex-start", px: 0.5 }}
            >
              {isRisk
                ? "Risk evidence stays visible while you review the transcript."
                : "Review and override controls stay in one place while you scroll."}
            </Typography>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
