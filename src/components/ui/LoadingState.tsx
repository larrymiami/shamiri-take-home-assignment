import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export function LoadingState() {
  return (
    <Stack spacing={2.5}>
      <Skeleton variant="rounded" height={64} />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Skeleton variant="rounded" height={132} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={132} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={132} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" height={132} sx={{ flex: 1 }} />
      </Stack>
      <Card>
        <CardContent>
          <Skeleton variant="text" width={220} height={42} />
          <Skeleton variant="text" width={480} />
          <Skeleton variant="rounded" height={340} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    </Stack>
  );
}
