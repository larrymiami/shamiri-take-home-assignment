import { Box, Card, CardContent, Chip, Divider, Grid, Skeleton, Stack } from "@mui/material";

export function SessionDetailSkeleton() {
  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Skeleton variant="text" width={180} sx={{ transform: "none" }} />
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1}
        >
          <Stack spacing={0.8}>
            <Skeleton variant="text" width={260} height={52} sx={{ transform: "none" }} />
            <Skeleton variant="text" width={320} sx={{ transform: "none" }} />
          </Stack>
          <Skeleton variant="rounded" width={126} height={36} />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
        <Chip label={<Skeleton variant="text" width={86} />} variant="outlined" />
        <Chip label={<Skeleton variant="text" width={58} />} variant="outlined" />
        <Chip label={<Skeleton variant="text" width={114} />} />
      </Stack>

      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
                <Skeleton variant="text" width={160} sx={{ transform: "none" }} />
                <Skeleton variant="text" width={70} sx={{ transform: "none" }} />
              </Stack>
              <Divider />
              <Stack spacing={0}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Box key={`session-detail-skeleton-row-${index}`} sx={{ px: 2.5, py: 2.25 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1}>
                        <Skeleton variant="text" width={42} sx={{ transform: "none" }} />
                        <Skeleton variant="rounded" width={70} height={24} />
                      </Stack>
                      <Skeleton variant="text" width="92%" height={28} sx={{ transform: "none" }} />
                      <Skeleton variant="text" width="86%" height={28} sx={{ transform: "none" }} />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.25 }}>
                <Stack spacing={1.5}>
                  <Skeleton variant="text" width={220} sx={{ transform: "none" }} />
                  <Skeleton variant="text" width="100%" sx={{ transform: "none" }} />
                  <Skeleton variant="text" width="95%" sx={{ transform: "none" }} />
                  <Skeleton variant="text" width="90%" sx={{ transform: "none" }} />
                </Stack>
              </CardContent>
            </Card>
            <Skeleton variant="rounded" height={166} />
            <Skeleton variant="rounded" height={312} />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
