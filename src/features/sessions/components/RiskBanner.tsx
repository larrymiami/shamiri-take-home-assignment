import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import type { SafetyFlag } from "@/features/sessions/types";

interface RiskBannerProps {
  flag: SafetyFlag;
  quotes?: string[];
  rationale?: string;
}

export function RiskBanner({ flag, quotes = [], rationale }: RiskBannerProps) {
  if (flag === "SAFE") {
    return (
      <Alert
        icon={<VerifiedRoundedIcon fontSize="small" />}
        severity="success"
        sx={{
          borderRadius: 3,
          borderColor: "var(--shamiri-border-green)",
          backgroundColor: "var(--shamiri-light-green)"
        }}
      >
        <Stack spacing={0.75}>
          <Typography sx={{ fontWeight: 800 }}>No Immediate Safety Risk Detected</Typography>
          {rationale ? (
            <Typography variant="body2" color="text.secondary">
              {rationale}
            </Typography>
          ) : null}
        </Stack>
      </Alert>
    );
  }

  return (
    <Alert
      icon={false}
      severity="error"
      sx={{
        borderRadius: 3,
        borderColor: "var(--shamiri-red-border)",
        backgroundColor: "var(--shamiri-red-bg)",
        "& .MuiAlert-message": {
          width: "100%"
        }
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <WarningAmberRoundedIcon fontSize="small" sx={{ color: "error.main" }} />
          <Typography
            sx={{
              fontWeight: 900,
              color: "error.main",
              textTransform: "uppercase",
              letterSpacing: 0.5
            }}
          >
            High Risk Detected
          </Typography>
        </Stack>
        {quotes.length > 0 ? (
          <Stack spacing={1}>
            {quotes.map((quote, index) => (
              <Box
                key={`risk-quote-${index + 1}`}
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "var(--shamiri-red-border)",
                  backgroundColor: "common.white"
                }}
              >
                <Typography sx={{ fontStyle: "italic", fontSize: 14 }} color="primary.main">
                  &quot;{quote}&quot;
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : null}
        {rationale ? (
          <Typography variant="body2" color="text.secondary">
            {rationale}
          </Typography>
        ) : null}
        <Chip
          size="small"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 16 }} />}
          label="Needs Supervisor Review"
          sx={{
            alignSelf: "flex-start",
            backgroundColor: "error.main",
            color: "common.white",
            fontWeight: 700,
            px: 1,
            py: 2,
            "& .MuiChip-icon": {
              color: "inherit",
              ml: 0.5
            }
          }}
        />
      </Stack>
    </Alert>
  );
}
