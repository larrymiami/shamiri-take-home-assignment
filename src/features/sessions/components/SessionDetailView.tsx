import Link from "next/link";
import dayjs from "dayjs";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Box, Breadcrumbs, Button, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { ReviewPanel } from "@/features/sessions/components/ReviewPanel";
import { RiskBanner } from "@/features/sessions/components/RiskBanner";
import { SessionInsightCard } from "@/features/sessions/components/SessionInsightCard";
import { SessionRubricCards } from "@/features/sessions/components/SessionRubricCards";
import { SessionStatusChip } from "@/features/sessions/components/SessionStatusChip";
import { TranscriptPanel } from "@/features/sessions/components/TranscriptPanel";
import {
  getSessionHeaderForSupervisor,
  getSessionInsightsForSupervisor,
  getSessionTranscriptForSupervisor
} from "@/features/sessions/server/sessions.repository";

interface SessionDetailViewProps {
  supervisorId: string;
  sessionId: string;
}

function estimateSessionDuration(transcriptText: string): string {
  const words = transcriptText.trim().split(/\s+/).length;
  const minutes = Math.max(20, Math.min(60, Math.round(words / 2.3)));
  return `${minutes}m`;
}

type HeaderData = NonNullable<Awaited<ReturnType<typeof getSessionHeaderForSupervisor>>>;
type TranscriptData = NonNullable<Awaited<ReturnType<typeof getSessionTranscriptForSupervisor>>>;
type InsightsData = NonNullable<Awaited<ReturnType<typeof getSessionInsightsForSupervisor>>>;

function SessionHeaderBlock({ header }: { header: HeaderData }) {
  return (
    <Stack spacing={0.8}>
      <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />} aria-label="breadcrumb">
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
          <SessionStatusChip status={header.displayStatus} size="medium" prominent />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography sx={{ fontWeight: 700 }}>{header.fellowName}</Typography>
          <Typography color="text.secondary">•</Typography>
          <Typography color="text.secondary">
            {dayjs(header.occurredAt).format("MMM D, YYYY")}
          </Typography>
          <Typography color="text.secondary">•</Typography>
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
            {header.groupId}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

function SessionMetaChipsBlock({ transcriptText }: { transcriptText: string }) {
  return (
    <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
      <Chip
        icon={<AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />}
        label={`Duration ${estimateSessionDuration(transcriptText)}`}
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
          color: "var(--shamiri-text-green-strong)",
          border: "1px solid",
          borderColor: "var(--shamiri-border-green-strong)"
        }}
      />
    </Stack>
  );
}

function HeaderFallback() {
  return (
    <Stack spacing={0.9}>
      <Skeleton variant="text" width={180} sx={{ transform: "none" }} />
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Skeleton variant="text" width={260} height={52} sx={{ transform: "none" }} />
        <Skeleton variant="rounded" width={96} height={32} sx={{ borderRadius: 999 }} />
      </Stack>
      <Skeleton variant="text" width={320} sx={{ transform: "none" }} />
    </Stack>
  );
}

function MetaFallback() {
  return (
    <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
      <Chip label={<Skeleton variant="text" width={84} />} variant="outlined" />
      <Chip label={<Skeleton variant="text" width={46} />} variant="outlined" />
      <Chip label={<Skeleton variant="text" width={98} />} />
    </Stack>
  );
}

function TranscriptFallback() {
  return (
    <Box id="transcript-panel" sx={{ scrollMarginTop: { xs: 72, lg: 92 } }}>
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "common.white"
        }}
      >
        <Stack spacing={0}>
          <Stack direction="row" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
            <Typography sx={{ fontWeight: 800, color: "primary.main" }}>Full Transcript</Typography>
            <Stack direction="row" spacing={1.5}>
              <Skeleton variant="text" width={70} sx={{ transform: "none" }} />
              <Skeleton variant="text" width={90} sx={{ transform: "none" }} />
            </Stack>
          </Stack>
          <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
          <Stack sx={{ px: 2, py: 1.75 }} spacing={1.3}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Stack key={`transcript-fallback-row-${index}`} direction="row" spacing={2}>
                <Skeleton variant="text" width={38} sx={{ transform: "none", mt: 0.2 }} />
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Skeleton variant="rounded" width={74} height={22} sx={{ borderRadius: 999 }} />
                  <Skeleton variant="text" width="92%" height={26} sx={{ transform: "none" }} />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function InsightsFallback() {
  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "var(--shamiri-brand-lighter-blue)",
          p: 2.25
        }}
      >
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
            AI-Generated Session Analysis
          </Typography>
          <Skeleton variant="text" width="100%" sx={{ transform: "none", fontSize: "0.85rem" }} />
          <Skeleton variant="text" width="93%" sx={{ transform: "none", fontSize: "0.85rem" }} />
        </Stack>
      </Box>
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "primary.main",
          p: 2.25
        }}
      >
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 800, color: "primary.main" }}>Supervisor Review</Typography>
          <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="rounded" height={42} sx={{ borderRadius: 1.5 }} />
        </Stack>
      </Box>
    </Stack>
  );
}

async function HeaderSection({ headerPromise }: { headerPromise: Promise<HeaderData | null> }) {
  const header = await headerPromise;

  if (!header) {
    notFound();
  }

  return <SessionHeaderBlock header={header} />;
}

async function MetaSection({
  transcriptPromise
}: {
  transcriptPromise: Promise<TranscriptData | null>;
}) {
  const transcript = await transcriptPromise;

  if (!transcript) {
    notFound();
  }

  return <SessionMetaChipsBlock transcriptText={transcript.transcriptText} />;
}

async function TranscriptSection({
  transcriptPromise
}: {
  transcriptPromise: Promise<TranscriptData | null>;
}) {
  const transcript = await transcriptPromise;

  if (!transcript) {
    notFound();
  }

  return (
    <Box id="transcript-panel" sx={{ scrollMarginTop: { xs: 72, lg: 92 } }}>
      <TranscriptPanel
        transcriptText={transcript.transcriptText}
        highlightedQuotes={transcript.highlightedQuotes}
      />
    </Box>
  );
}

async function InsightsSection({
  sessionId,
  headerPromise,
  transcriptPromise,
  insightsPromise
}: {
  sessionId: string;
  headerPromise: Promise<HeaderData | null>;
  transcriptPromise: Promise<TranscriptData | null>;
  insightsPromise: Promise<InsightsData | null>;
}) {
  const [header, transcript, insights] = await Promise.all([
    headerPromise,
    transcriptPromise,
    insightsPromise
  ]);

  if (!header || !transcript || !insights) {
    notFound();
  }

  return (
    <Stack spacing={1.5}>
      <SessionInsightCard
        sessionId={sessionId}
        analysis={insights.analysis}
        finalStatus={insights.finalStatus}
        hasReview={Boolean(insights.review)}
      />
      {insights.analysis ? (
        <RiskBanner
          flag={insights.analysis.riskDetection.flag}
          quotes={insights.analysis.riskDetection.extractedQuotes}
          rationale={insights.analysis.riskDetection.rationale}
        />
      ) : null}
      {!insights.analysis && insights.displayStatus === "RISK" ? (
        <RiskBanner
          flag="RISK"
          rationale="Session status indicates elevated risk. Generate analysis for extracted evidence."
        />
      ) : null}
      {insights.analysis ? <SessionRubricCards analysis={insights.analysis} /> : null}
      <Box sx={{ display: { xs: "block", lg: "none" } }}>
        <Stack spacing={1.2}>
          <SessionHeaderBlock header={header} />
          <SessionMetaChipsBlock transcriptText={transcript.transcriptText} />
        </Stack>
      </Box>
      <ReviewPanel
        sessionId={sessionId}
        currentStatus={insights.displayStatus}
        hasAnalysis={Boolean(insights.analysis)}
        existingReview={insights.review}
      />
      <Typography
        variant="body2"
        sx={{
          alignSelf: "flex-start",
          px: 0.5,
          color: "text.primary",
          opacity: 0.74,
          fontSize: 12.5
        }}
      >
        Review and override controls stay in one place while you scroll.
      </Typography>
    </Stack>
  );
}

export async function SessionDetailView({ supervisorId, sessionId }: SessionDetailViewProps) {
  const headerPromise = getSessionHeaderForSupervisor(supervisorId, sessionId);
  const transcriptPromise = getSessionTranscriptForSupervisor(supervisorId, sessionId);
  const insightsPromise = getSessionInsightsForSupervisor(supervisorId, sessionId);

  return (
    <Grid container spacing={2.5} alignItems="flex-start">
      {/* On mobile, transcript is intentionally below right-rail actions for faster triage flow. */}
      <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 2, lg: 1 } }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Suspense fallback={<HeaderFallback />}>
              <HeaderSection headerPromise={headerPromise} />
            </Suspense>
          </Box>
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Suspense fallback={<MetaFallback />}>
              <MetaSection transcriptPromise={transcriptPromise} />
            </Suspense>
          </Box>

          <Suspense fallback={<TranscriptFallback />}>
            <TranscriptSection transcriptPromise={transcriptPromise} />
          </Suspense>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 1, lg: 2 } }}>
        {/* Keep analysis/risk/review visible while scrolling long transcripts on desktop. */}
        <Box sx={{ position: { lg: "sticky" }, top: { lg: 84 } }}>
          <Stack spacing={1.5}>
            <Button
              href="#transcript-panel"
              variant="outlined"
              size="large"
              startIcon={<ArrowDownwardRoundedIcon />}
              sx={{
                width: "100%",
                justifyContent: "center",
                textTransform: "none",
                py: 1.25,
                borderRadius: 2,
                display: { xs: "inline-flex", lg: "none" }
              }}
            >
              Jump to Transcript
            </Button>
            <Suspense fallback={<InsightsFallback />}>
              <InsightsSection
                sessionId={sessionId}
                headerPromise={headerPromise}
                transcriptPromise={transcriptPromise}
                insightsPromise={insightsPromise}
              />
            </Suspense>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
