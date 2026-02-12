import type { ReactNode } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  emphasized?: boolean;
}

export function MetricCard({ title, value, subtitle, icon, emphasized = false }: MetricCardProps) {
  return (
    <Card
      sx={{
        backgroundColor: emphasized ? "var(--shamiri-red-bg)" : "common.white",
        borderColor: emphasized ? "var(--shamiri-red-border)" : "divider"
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.25}>
          <Typography
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 1.4,
              fontSize: 12,
              fontWeight: 800
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              component="div"
              sx={{
                fontSize: 44,
                lineHeight: 1,
                fontWeight: 800,
                color: emphasized ? "error.main" : "primary.main"
              }}
            >
              {value}
            </Typography>
            {icon}
          </Stack>
          {subtitle ? (
            <Typography
              component="div"
              color="text.secondary"
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
