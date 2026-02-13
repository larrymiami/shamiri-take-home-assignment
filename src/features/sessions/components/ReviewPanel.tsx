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
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import type { SessionDetailDTO } from "@/features/sessions/types";
import type { ReviewDecision, SessionStatus } from "@/server/types/domain";

interface ReviewPanelProps {
  sessionId: string;
  currentStatus: SessionStatus;
  existingReview?: SessionDetailDTO["review"];
}

const ALL_STATUS_OPTIONS: SessionStatus[] = ["PROCESSED", "SAFE", "FLAGGED_FOR_REVIEW", "RISK"];

export function ReviewPanel({ sessionId, currentStatus, existingReview }: ReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [decision, setDecision] = useState<ReviewDecision>(existingReview?.decision ?? "VALIDATED");
  const [finalStatus, setFinalStatus] = useState<SessionStatus>(
    existingReview?.finalStatus ?? currentStatus
  );
  const [note, setNote] = useState(existingReview?.note ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requiresNote = decision === "REJECTED" || decision === "OVERRIDDEN";
  const statusOptions = useMemo(() => {
    const ordered = [currentStatus, ...ALL_STATUS_OPTIONS];
    return Array.from(new Set(ordered));
  }, [currentStatus]);

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
            decision,
            finalStatus,
            note: trimmedNote
          })
        });
        const data = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          setErrorMessage(data?.error ?? "Could not save review. Please try again.");
          return;
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

          <TextField
            select
            label="Decision"
            value={decision}
            onChange={(event) => {
              const nextDecision = event.target.value as ReviewDecision;
              setDecision(nextDecision);
            }}
            size="small"
          >
            <MenuItem value="VALIDATED">Validate AI Analysis</MenuItem>
            <MenuItem value="REJECTED">Reject AI Analysis</MenuItem>
            <MenuItem value="OVERRIDDEN">Override AI Status</MenuItem>
          </TextField>

          <TextField
            select
            label="Override AI Status"
            value={finalStatus}
            onChange={(event) => {
              setFinalStatus(event.target.value as SessionStatus);
            }}
            size="small"
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status === currentStatus ? `Maintain AI Recommendation (${status})` : status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            multiline
            minRows={4}
            label="Supervisor Note"
            placeholder="Add clinical notes or feedback..."
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
            }}
            required={requiresNote}
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
