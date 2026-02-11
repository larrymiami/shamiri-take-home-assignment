import { Box, Card, Divider, Link, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentSession } from "@/server/auth/session";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: { xs: 4, md: 8 },
        backgroundColor: "background.default"
      }}
    >
      <Stack width="100%" maxWidth={560} spacing={4} alignItems="center">
        <Stack alignItems="center" spacing={1}>
          <Image
            src="/Shamiri%20Wordmark%20-%20Color%20Version.png"
            alt="Shamiri"
            width={260}
            height={68}
            priority
          />
          <Typography
            sx={{
              fontSize: 16,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: "text.secondary"
            }}
          >
            Supervisor Copilot
          </Typography>
        </Stack>

        <Card
          sx={{
            width: "100%",
            maxWidth: 560,
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            backgroundColor: "common.white"
          }}
        >
          <Stack spacing={3.5}>
            <Box textAlign="center">
              <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 38, sm: 44 }, mb: 1 }}>
                Supervisor Login
              </Typography>
              <Box
                sx={{
                  width: 70,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: "secondary.main",
                  mx: "auto",
                  mb: 2
                }}
              />
              <Typography color="text.secondary" sx={{ fontSize: 20 }}>
                Access Tiered Care supervision tools and
                <br />
                session safety insights.
              </Typography>
            </Box>

            <LoginForm />

            <Divider />

            <Typography align="center" color="text.secondary" sx={{ fontSize: 18 }}>
              Don&apos;t have an account?{" "}
              <Link href="#" underline="hover" sx={{ fontWeight: 700 }}>
                Contact Administrator
              </Link>
            </Typography>
          </Stack>
        </Card>

        <Stack component="footer" alignItems="center" spacing={2.5}>
          <Stack direction="row" alignItems="center" spacing={1.5} width="100%" maxWidth={420}>
            <Divider sx={{ flex: 1, opacity: 0.6 }} />
            <Typography
              sx={{
                fontSize: 12,
                letterSpacing: 2.2,
                color: "text.secondary"
              }}
            >
              Shamiri Institute · Nairobi, Kenya
            </Typography>
            <Divider sx={{ flex: 1, opacity: 0.6 }} />
          </Stack>
          <Stack direction="row" spacing={4}>
            <Link href="#" underline="hover" color="text.secondary" sx={{ fontWeight: 600 }}>
              Privacy Policy
            </Link>
            <Link href="#" underline="hover" color="text.secondary" sx={{ fontWeight: 600 }}>
              Terms of Service
            </Link>
            <Link href="#" underline="hover" color="text.secondary" sx={{ fontWeight: 600 }}>
              Support
            </Link>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
