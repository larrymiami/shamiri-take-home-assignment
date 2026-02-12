import Image from "next/image";
import { AppBar, Box, Skeleton, Stack, Toolbar, Typography } from "@mui/material";

export function TopBarSkeleton() {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: "common.white",
        borderBottom: "1px solid",
        borderColor: "divider"
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1,
          minHeight: "unset",
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", md: "row" }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 92, height: 24, position: "relative" }}>
            <Image
              src="/Shamiri%20Wordmark%20-%20Color%20Version.png"
              alt="Shamiri"
              fill
              sizes="92px"
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Box>
          <Typography
            sx={{
              color: "text.secondary",
              letterSpacing: 1.2,
              fontWeight: 700,
              fontSize: 11,
              textTransform: "uppercase"
            }}
          >
            Supervisor Dashboard
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ textAlign: "right" }}>
            <Skeleton variant="text" width={124} sx={{ transform: "none", ml: "auto" }} />
            <Skeleton variant="text" width={162} sx={{ transform: "none", ml: "auto" }} />
          </Box>
          <Skeleton variant="circular" width={34} height={34} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
