import Image from "next/image";
import { AppBar, Box, Container, Stack, Toolbar, Typography } from "@mui/material";
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
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            py: 1,
            minHeight: "unset",
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
          >
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

          <UserMenu name={name} email={email} />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
