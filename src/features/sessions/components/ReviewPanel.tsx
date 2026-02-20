"use client";

import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import type { SessionDetailDTO } from "@/features/sessions/types";
import type { FinalReviewStatus, ReviewDecision, SessionStatus } from "@/server/types/domain";

interface ReviewPanelProps {
  sessionId: string;
  currentStatus: SessionStatus;
  hasAnalysis?: boolean;
  existingReview?: SessionDetailDTO["review"];
}

const FINAL_STATUS_OPTIONS: FinalReviewStatus[] = ["SAFE", "FLAGGED_FOR_REVIEW", "RISK"];

function normalizeReviewDecision(
  decision: ReviewDecision | undefined,
  hasAnalysis: boolean
): ReviewDecision {
  if (!decision) {
    return hasAnalysis ? "VALIDATED" : "OVERRIDDEN";
  }

  if (!hasAnalysis && decision !== "OVERRIDDEN") {
    // Without analysis, only manual override is a valid decision path.
    return "OVERRIDDEN";
  }

  return decision;
}

function normalizeFinalStatus(
  existingFinalStatus: SessionStatus | undefined,
  currentStatus: SessionStatus
): FinalReviewStatus {
  if (
    existingFinalStatus === "SAFE" ||
    existingFinalStatus === "FLAGGED_FOR_REVIEW" ||
    existingFinalStatus === "RISK"
  ) {
    return existingFinalStatus;
  }

  if (
    currentStatus === "SAFE" ||
    currentStatus === "FLAGGED_FOR_REVIEW" ||
    currentStatus === "RISK"
  ) {
    return currentStatus;
  }

  // When no AI/review signal exists yet, default to SAFE and let supervisors adjust explicitly.
  return "SAFE";
}

export function ReviewPanel({
  sessionId,
  currentStatus,
  hasAnalysis = false,
  existingReview
}: ReviewPanelProps) {
  const sessionIdSafe = sessionId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const decisionLabelId = `review-decision-label-${sessionIdSafe}`;
  const decisionFieldId = `review-decision-${sessionIdSafe}`;
  const finalStatusLabelId = `review-final-status-label-${sessionIdSafe}`;
  const finalStatusFieldId = `review-final-status-${sessionIdSafe}`;
  const noteFieldId = `review-note-${sessionIdSafe}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [decision, setDecision] = useState<ReviewDecision>(
    normalizeReviewDecision(existingReview?.decision, hasAnalysis)
  );
  const [finalStatus, setFinalStatus] = useState<FinalReviewStatus>(
    normalizeFinalStatus(existingReview?.finalStatus, currentStatus)
  );
  const [note, setNote] = useState(existingReview?.note ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Prevent invalid payloads when legacy review data predates AI generation.
  const effectiveDecision = hasAnalysis ? decision : "OVERRIDDEN";
  const requiresNote = effectiveDecision === "REJECTED" || effectiveDecision === "OVERRIDDEN";
  const decisionOptions: Array<{ value: ReviewDecision; label: string }> = hasAnalysis
    ? [
        { value: "VALIDATED", label: "Validate AI Analysis" },
        { value: "REJECTED", label: "Reject AI Analysis" },
        { value: "OVERRIDDEN", label: "Override AI Status" }
      ]
    : [{ value: "OVERRIDDEN", label: "Set Final Status Manually" }];
  const statusOptions = useMemo(() => FINAL_STATUS_OPTIONS, []);

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedNote = note.trim();

    if (requiresNote && !trimmedNote) {
      setErrorMessage("A supervisor note is required when rejecting or overriding.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            decision: effectiveDecision,
            finalStatus,
            note: trimmedNote
          })
        });
        const data = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          setErrorMessage(data?.error ?? "Could not save review. Please try again.");
          return;
        }

        if (!requiresNote) {
          setNote("");
        }
        setSuccessMessage("Review saved successfully.");
        router.refresh();
      } catch {
        setErrorMessage("Network error while saving review. Please try again.");
      }
    });
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        borderColor: "primary.main",
        borderWidth: 2
      }}
    >
      <CardContent component="form" onSubmit={handleSubmit} sx={{ p: 2.25 }}>
        <Stack spacing={1.75}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditNoteOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
            <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
              Supervisor Review
            </Typography>
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel id={decisionLabelId}>Decision</InputLabel>
            <Select
              id={decisionFieldId}
              name="decision"
              labelId={decisionLabelId}
              label="Decision"
              value={decision}
              onChange={(event) => {
                const nextDecision = event.target.value as ReviewDecision;
                setDecision(nextDecision);
              }}
              inputProps={{ "aria-label": "Supervisor review decision" }}
            >
              {decisionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!hasAnalysis ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              AI analysis has not been generated yet. You can still set a supervisor final status
              manually.
            </Alert>
          ) : null}

          <FormControl fullWidth size="small">
            <InputLabel id={finalStatusLabelId}>
              {hasAnalysis ? "Override AI Status" : "Set Final Status"}
            </InputLabel>
            <Select
              id={finalStatusFieldId}
              name="finalStatus"
              labelId={finalStatusLabelId}
              label={hasAnalysis ? "Override AI Status" : "Set Final Status"}
              value={finalStatus}
              onChange={(event) => {
                setFinalStatus(event.target.value as FinalReviewStatus);
              }}
              inputProps={{
                "aria-label": hasAnalysis ? "Override AI status" : "Set final status manually"
              }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === currentStatus
                    ? hasAnalysis
                      ? `Maintain AI Recommendation (${status})`
                      : `Maintain Current Status (${status})`
                    : status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            id={noteFieldId}
            name="note"
            multiline
            minRows={4}
            label="Supervisor Note"
            placeholder="Add clinical notes or feedback..."
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
            }}
            required={requiresNote}
            slotProps={{
              htmlInput: {
                "aria-label": "Supervisor note"
              }
            }}
            helperText={
              requiresNote ? "Required for rejected or overridden decisions." : "Optional note."
            }
          />

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

          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? "Saving review..." : "Save Review"}
          </Button>

          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Saved decisions update session final status and dashboard review state.
          </Alert>

          {existingReview ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Latest review: {existingReview.decision} • {existingReview.finalStatus}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
