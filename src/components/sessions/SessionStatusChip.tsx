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
          backgroundColor: "#9a8ee6",
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
          borderColor: "secondary.main",
          color: "primary.main",
          backgroundColor: "#f1fbd1"
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
        borderColor: "#d7dced",
        backgroundColor: "#f4f6fb",
        color: "#8892b0"
      }}
    />
  );
}
