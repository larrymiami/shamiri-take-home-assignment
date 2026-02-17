"use client";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SubjectRoundedIcon from "@mui/icons-material/SubjectRounded";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Stack,
  Typography
} from "@mui/material";

interface TranscriptPanelProps {
  transcriptText: string;
  highlightedQuotes?: string[];
}

interface TranscriptEntry {
  id: string;
  timestampLabel: string;
  speaker: "FELLOW" | "STUDENT" | "SESSION";
  content: string;
  highlighted: boolean;
}

const TURN_SECONDS = 22;
const DOWNLOAD_FILE_NAME = "session-transcript.csv";
const CSV_FORMULA_PREFIX_PATTERN = /^[\s]*[=+\-@]/;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function formatTimestampLabel(index: number): string {
  const totalSeconds = index * TURN_SECONDS;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function inferSpeaker(paragraph: string): TranscriptEntry["speaker"] {
  const normalized = paragraph.toLowerCase();

  if (
    normalized.startsWith("participant statement:") ||
    normalized.startsWith("student:") ||
    normalized.includes("student")
  ) {
    return "STUDENT";
  }

  if (normalized.startsWith("session facilitator:")) {
    return "SESSION";
  }

  return "FELLOW";
}

function stripSpeakerPrefix(paragraph: string): string {
  return paragraph
    .replace(/^session facilitator:\s*/i, "")
    .replace(/^participant statement:\s*/i, "")
    .replace(/^student:\s*/i, "")
    .trim();
}

function shouldSkipTranscriptSegment(paragraph: string, content: string): boolean {
  const normalized = paragraph.toLowerCase();

  return normalized.startsWith("session facilitator:") && /\|\s*group:/i.test(content);
}

function buildTranscriptEntries(
  transcriptText: string,
  highlightedQuotes: string[]
): TranscriptEntry[] {
  const normalizedQuotes = highlightedQuotes
    .map((quote) => normalizeText(quote))
    .filter((quote) => quote.length > 0);

  return transcriptText
    .split(/\n\s*\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const content = stripSpeakerPrefix(segment);
      if (shouldSkipTranscriptSegment(segment, content)) {
        return null;
      }

      return {
        segment,
        content
      };
    })
    .filter((item): item is { segment: string; content: string } => item !== null)
    .map((item, index) => {
      const { segment, content } = item;
      const normalizedContent = normalizeText(content);
      const highlighted =
        normalizedQuotes.length > 0 &&
        normalizedQuotes.some((quote) => normalizedContent.includes(quote));

      return {
        id: `transcript-entry-${index + 1}`,
        timestampLabel: formatTimestampLabel(index),
        speaker: inferSpeaker(segment),
        content,
        highlighted
      };
    });
}

function speakerBadgeStyles(speaker: TranscriptEntry["speaker"]) {
  if (speaker === "STUDENT") {
    return {
      backgroundColor: "warning.main",
      color: "common.white"
    };
  }

  if (speaker === "SESSION") {
    return {
      backgroundColor: "var(--shamiri-background-secondary)",
      color: "text.secondary",
      border: "1px solid",
      borderColor: "divider"
    };
  }

  return {
    backgroundColor: "info.main",
    color: "common.white"
  };
}

function escapeCsvValue(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function sanitizeCsvCell(value: string): string {
  if (!CSV_FORMULA_PREFIX_PATTERN.test(value)) {
    return value;
  }

  // Prevent spreadsheet apps from treating user-controlled cells as formulas.
  return `'${value}`;
}

function buildTranscriptCsv(entries: TranscriptEntry[]): string {
  const header = ["Timestamp", "Speaker", "Text"].join(",");
  const rows = entries.map((entry) =>
    [entry.timestampLabel, entry.speaker, entry.content]
      .map((value) => sanitizeCsvCell(value))
      .map((value) => escapeCsvValue(value))
      .join(",")
  );

  return [header, ...rows].join("\n");
}

export function TranscriptPanel({ transcriptText, highlightedQuotes = [] }: TranscriptPanelProps) {
  const theme = useTheme();
  const isDesktopViewport = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
  const entries = buildTranscriptEntries(transcriptText, highlightedQuotes);
  const csvContent = buildTranscriptCsv(entries);
  const downloadHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  const [isMobileTranscriptOpen, setIsMobileTranscriptOpen] = useState(false);

  useEffect(() => {
    const expandOnTranscriptHash = () => {
      if (window.location.hash === "#transcript-panel") {
        // Supports "Jump to Transcript" CTA from the right rail on mobile.
        setIsMobileTranscriptOpen(true);
      }
    };

    expandOnTranscriptHash();
    window.addEventListener("hashchange", expandOnTranscriptHash);

    return () => {
      window.removeEventListener("hashchange", expandOnTranscriptHash);
    };
  }, []);

  const renderTranscriptRows = () => (
    <Stack sx={{ maxHeight: { xs: "none", lg: "calc(100vh - 280px)" }, overflowY: "auto" }}>
      {entries.map((entry) => (
        <Box
          key={entry.id}
          sx={{
            px: { xs: 2, md: 2.5 },
            py: { xs: 1.5, md: 1.9 },
            backgroundColor: entry.highlighted ? "var(--shamiri-red-bg)" : "transparent",
            ...(entry.highlighted
              ? {
                  mx: { xs: 1, md: 1.25 },
                  my: 0.6,
                  borderRadius: 2,
                  borderLeft: "4px solid",
                  borderLeftColor: "error.main"
                }
              : null)
          }}
        >
          <Stack direction="row" spacing={1.75} alignItems="flex-start">
            <Stack
              sx={{
                width: { xs: 48, md: 54 },
                minWidth: { xs: 48, md: 54 },
                pt: 0.2,
                color: entry.highlighted ? "error.main" : "text.disabled"
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "inherit",
                  letterSpacing: 0.35,
                  fontSize: { xs: 10, md: 10.5 }
                }}
              >
                {entry.timestampLabel}
              </Typography>
            </Stack>

            <Stack spacing={0.8} sx={{ flex: 1, minWidth: 0 }}>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  alignSelf: "flex-start",
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  mb: 0.35,
                  fontSize: { xs: 9, md: 10 },
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.25,
                  ...speakerBadgeStyles(entry.speaker)
                }}
              >
                {entry.speaker}
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: 13, md: 14 },
                  lineHeight: { xs: 1.5, md: 1.55 },
                  color: "primary.main",
                  fontStyle: entry.highlighted ? "italic" : "normal"
                }}
              >
                {entry.content}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );

  return (
    <Card sx={{ borderRadius: 3, backgroundColor: "common.white" }}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: { xs: 2, md: 2.5 },
            py: { xs: 1.2, md: 1.35 },
            backgroundColor: "background.default"
          }}
        >
          <Stack direction="row" spacing={0.8} alignItems="center">
            <SubjectRoundedIcon sx={{ color: "primary.main", fontSize: { xs: 16, md: 17 } }} />
            <Typography
              sx={{ fontWeight: 800, fontSize: { xs: 16, md: 17 }, color: "primary.main" }}
            >
              Full Transcript
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: 12, md: 13 } }}
            >
              {entries.length} transcript turns
            </Typography>
            <Button
              component="a"
              href={downloadHref}
              download={DOWNLOAD_FILE_NAME}
              size="small"
              startIcon={<DownloadRoundedIcon fontSize="small" />}
              sx={{
                color: "primary.main",
                textTransform: "none"
              }}
            >
              Download CSV
            </Button>
          </Stack>
        </Stack>

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: { xs: 2, md: 2.5 }, py: 1, display: { xs: "flex", md: "none" } }}
        >
          <Typography variant="caption" color="text.secondary">
            Hidden by default on mobile for faster review flow.
          </Typography>
          <Button
            onClick={() => {
              setIsMobileTranscriptOpen((value) => !value);
            }}
            size="small"
            variant="text"
            startIcon={
              isMobileTranscriptOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />
            }
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {isMobileTranscriptOpen ? "Hide Transcript" : "Show Transcript"}
          </Button>
        </Stack>

        {isDesktopViewport ? (
          <Box>{renderTranscriptRows()}</Box>
        ) : (
          // Unmount while collapsed to avoid rendering large transcript trees on mobile.
          <Collapse in={isMobileTranscriptOpen} unmountOnExit>
            {renderTranscriptRows()}
          </Collapse>
        )}
      </CardContent>
    </Card>
  );
}
