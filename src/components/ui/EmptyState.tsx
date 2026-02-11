import { Card, CardContent, Stack, Typography } from "@mui/material";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card sx={{ backgroundColor: "common.white" }}>
      <CardContent sx={{ py: 6 }}>
        <Stack spacing={1} textAlign="center">
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
