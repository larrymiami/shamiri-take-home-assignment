import Image from "next/image";
import { AppBar, Box, Stack, Toolbar, Typography } from "@mui/material";
import { UserMenu } from "@/components/layout/UserMenu";

interface TopBarProps {
  name: string;
  email: string;
}

export function TopBar({ name, email }: TopBarProps) {
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
            <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{name}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              {email}
            </Typography>
          </Box>
          <UserMenu name={name} email={email} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
