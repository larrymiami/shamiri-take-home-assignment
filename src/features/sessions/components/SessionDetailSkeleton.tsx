import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";

export function SessionDetailSkeleton() {
  return (
    <Grid container spacing={2.5} alignItems="flex-start">
      <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 2, lg: 1 } }}>
        <Stack spacing={1.5}>
          <Stack spacing={0.9}>
            <Skeleton variant="text" width={180} sx={{ transform: "none" }} />
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Skeleton variant="text" width={260} height={52} sx={{ transform: "none" }} />
              <Skeleton variant="rounded" width={96} height={32} sx={{ borderRadius: 999 }} />
            </Stack>
            <Skeleton variant="text" width={320} sx={{ transform: "none" }} />
          </Stack>

          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Chip label="Duration --m" variant="outlined" />
            <Chip label="Tier 1" variant="outlined" />
            <Chip label="Transcript Ready" />
          </Stack>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ px: 2.5, py: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                  Full Transcript
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Skeleton variant="text" width={70} sx={{ transform: "none" }} />
                  <Skeleton variant="text" width={90} sx={{ transform: "none" }} />
                </Stack>
              </Stack>
              <Divider />
              <Stack spacing={0}>
                {Array.from({ length: 7 }).map((_, index) => (
                  <Box key={`session-detail-skeleton-row-${index}`} sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" spacing={2}>
                      <Stack sx={{ minWidth: 44, pt: 0.1 }}>
                        <Skeleton variant="text" width={38} sx={{ transform: "none" }} />
                      </Stack>
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Skeleton
                          variant="rounded"
                          width={74}
                          height={22}
                          sx={{ borderRadius: 999 }}
                        />
                        <Skeleton
                          variant="text"
                          width="92%"
                          height={26}
                          sx={{ transform: "none" }}
                        />
                        <Skeleton
                          variant="text"
                          width="86%"
                          height={26}
                          sx={{ transform: "none" }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 1, lg: 2 } }}>
        <Stack spacing={2}>
          <Skeleton
            variant="rounded"
            height={52}
            sx={{ borderRadius: 2, display: { xs: "block", lg: "none" } }}
          />

          <Card
            sx={{
              borderRadius: 3,
              backgroundColor: "var(--shamiri-brand-lighter-blue)",
              minHeight: 132
            }}
          >
            <CardContent sx={{ p: 2.25 }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                  AI-Generated Session Analysis
                </Typography>
                <Skeleton
                  variant="text"
                  width="100%"
                  sx={{ transform: "none", fontSize: "0.85rem" }}
                />
                <Skeleton
                  variant="text"
                  width="93%"
                  sx={{ transform: "none", fontSize: "0.85rem" }}
                />
                <Skeleton
                  variant="text"
                  width="84%"
                  sx={{ transform: "none", fontSize: "0.85rem" }}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              borderColor: "#f2cfab",
              backgroundColor: "#fff7ee",
              minHeight: 118
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.1}>
                <Typography sx={{ fontWeight: 900, color: "#995200", letterSpacing: 0.4 }}>
                  SAFETY CLASSIFICATION IN PROGRESS
                </Typography>
                <Skeleton variant="rounded" height={36} sx={{ borderRadius: 1.5 }} />
                <Skeleton variant="text" width="92%" sx={{ transform: "none" }} />
                <Skeleton variant="text" width="74%" sx={{ transform: "none" }} />
              </Stack>
            </CardContent>
          </Card>

          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`session-detail-rubric-skeleton-${index}`}
              sx={{ borderRadius: 3, minHeight: 128 }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Skeleton variant="text" width={140} sx={{ transform: "none" }} />
                    <Skeleton
                      variant="rounded"
                      width={106}
                      height={22}
                      sx={{ borderRadius: 999 }}
                    />
                  </Stack>
                  <Skeleton variant="text" width="95%" sx={{ transform: "none" }} />
                  <Skeleton variant="text" width="84%" sx={{ transform: "none" }} />
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Card
            sx={{ borderRadius: 3, borderColor: "primary.main", borderWidth: 2, minHeight: 288 }}
          >
            <CardContent sx={{ p: 2.25 }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                  Supervisor Review
                </Typography>
                <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1.5 }} />
                <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1.5 }} />
                <Skeleton variant="rounded" height={110} sx={{ borderRadius: 1.5 }} />
                <Skeleton variant="rounded" height={42} sx={{ borderRadius: 1.5 }} />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}
