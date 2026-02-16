import { Chip } from "@mui/material";
import type { SessionStatus } from "@/server/types/domain";

interface SessionStatusChipProps {
  status: SessionStatus;
  size?: "small" | "medium";
  prominent?: boolean;
}

const statusLabel: Record<SessionStatus, string> = {
  PROCESSED: "Processed",
  FLAGGED_FOR_REVIEW: "Flagged",
  SAFE: "Safe",
  RISK: "Risk"
};

export function SessionStatusChip({
  status,
  size = "small",
  prominent = false
}: SessionStatusChipProps) {
  const baseSx = prominent
    ? {
        height: 36,
        fontSize: 13,
        px: 1.2
      }
    : undefined;

  if (status === "RISK") {
    return (
      <Chip
        size={size}
        label={statusLabel[status]}
        sx={{
          backgroundColor: "error.main",
          color: "common.white",
          ...baseSx
        }}
      />
    );
  }

  if (status === "FLAGGED_FOR_REVIEW") {
    return (
      <Chip
        size={size}
        label={statusLabel[status]}
        sx={{
          backgroundColor: "warning.main",
          color: "common.white",
          ...baseSx
        }}
      />
    );
  }

  if (status === "SAFE") {
    return (
      <Chip
        variant="outlined"
        size={size}
        label={statusLabel[status]}
        sx={{
          borderColor: "var(--shamiri-border-green)",
          color: "success.main",
          backgroundColor: "var(--shamiri-light-green)",
          ...baseSx
        }}
      />
    );
  }

  return (
    <Chip
      variant="outlined"
      size={size}
      label={statusLabel[status]}
      sx={{
        borderColor: "divider",
        backgroundColor: "var(--shamiri-background-secondary)",
        color: "text.secondary",
        ...baseSx
      }}
    />
  );
}
