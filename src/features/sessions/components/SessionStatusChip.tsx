import { Chip } from "@mui/material";
import type { SessionStatus } from "@/server/types/domain";

interface SessionStatusChipProps {
  status: SessionStatus;
}

const statusLabel: Record<SessionStatus, string> = {
  PROCESSED: "Processed",
  FLAGGED_FOR_REVIEW: "Flagged",
  SAFE: "Safe",
  RISK: "Risk"
};

export function SessionStatusChip({ status }: SessionStatusChipProps) {
  if (status === "RISK") {
    return (
      <Chip
        size="small"
        label={statusLabel[status]}
        sx={{
          backgroundColor: "error.main",
          color: "common.white"
        }}
      />
    );
  }

  if (status === "FLAGGED_FOR_REVIEW") {
    return (
      <Chip
        size="small"
        label={statusLabel[status]}
        sx={{
          backgroundColor: "warning.main",
          color: "common.white"
        }}
      />
    );
  }

  if (status === "SAFE") {
    return (
      <Chip
        variant="outlined"
        size="small"
        label={statusLabel[status]}
        sx={{
          borderColor: "var(--shamiri-border-green)",
          color: "success.main",
          backgroundColor: "var(--shamiri-light-green)"
        }}
      />
    );
  }

  return (
    <Chip
      variant="outlined"
      size="small"
      label={statusLabel[status]}
      sx={{
        borderColor: "divider",
        backgroundColor: "var(--shamiri-background-secondary)",
        color: "text.secondary"
      }}
    />
  );
}
