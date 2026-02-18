import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
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
const statusIcon: Record<SessionStatus, typeof CheckCircleOutlineRoundedIcon> = {
  PROCESSED: TaskAltRoundedIcon,
  FLAGGED_FOR_REVIEW: FlagOutlinedIcon,
  SAFE: CheckCircleOutlineRoundedIcon,
  RISK: ErrorOutlineRoundedIcon
};

export function SessionStatusChip({
  status,
  size = "small",
  prominent = false
}: SessionStatusChipProps) {
  const Icon = statusIcon[status];
  const sizeSx =
    size === "small"
      ? {
          height: 24,
          px: 0.4,
          "& .MuiChip-label": {
            px: 0.85,
            fontWeight: 700
          },
          "& .MuiChip-icon": {
            ml: 0.75,
            mr: -0.35,
            fontSize: 16,
            color: "inherit"
          }
        }
      : {
          height: 30,
          px: 0.6,
          "& .MuiChip-label": {
            px: 1,
            fontWeight: 700
          },
          "& .MuiChip-icon": {
            ml: 0.9,
            mr: -0.25,
            fontSize: 18,
            color: "inherit"
          }
        };

  const baseSx = {
    ...sizeSx,
    ...(prominent
      ? {
          height: 36,
          fontSize: 13,
          px: 1.2,
          "& .MuiChip-label": {
            px: 1.25,
            fontWeight: 700
          },
          "& .MuiChip-icon": {
            ml: 1,
            mr: -0.25,
            fontSize: 18,
            color: "inherit"
          }
        }
      : {})
  };

  if (status === "RISK") {
    return (
      <Chip
        size={size}
        icon={<Icon fontSize="small" />}
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
        icon={<Icon fontSize="small" />}
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
        icon={<Icon fontSize="small" />}
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
      icon={<Icon fontSize="small" />}
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
