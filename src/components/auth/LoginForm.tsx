"use client";

import type { SyntheticEvent as ReactSyntheticEvent } from "react";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { AUTH_COPY } from "@/components/auth/constants";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // UX-only for take-home scope; persistent device trust is not implemented yet.
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: ReactSyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      setErrorMessage(null);

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        callbackUrl: "/dashboard",
        redirect: false
      });

      if (!result || result.error || !result.ok) {
        setErrorMessage(AUTH_COPY.INVALID_CREDENTIALS_MESSAGE);
        return;
      }

      router.push(result?.url ?? "/dashboard");
      router.refresh();
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography
            component="label"
            htmlFor="email"
            sx={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}
          >
            Email address
          </Typography>
          <TextField
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="supervisor@shamiri.org"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(errorMessage)}
            sx={{ mt: 1 }}
          />
        </Box>

        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography
              component="label"
              htmlFor="password"
              sx={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}
            >
              Password
            </Typography>
            <Link href="#" underline="hover" sx={{ fontWeight: 700, fontSize: 14 }}>
              Forgot password?
            </Link>
          </Stack>
          <TextField
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={Boolean(errorMessage)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          {errorMessage ? (
            <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, mt: 1.5 }}>
              {errorMessage}
            </Alert>
          ) : null}
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
              sx={{
                pl: 0
              }}
            />
          }
          label="Remember this device"
        />

        <Button type="submit" variant="contained" size="large" disabled={isPending}>
          {isPending ? "Signing In..." : "Sign In"}
        </Button>

        <Typography align="center" color="text.secondary" sx={{ fontSize: 15 }}>
          Confidential supervision tools for Tiered Care delivery.
        </Typography>
      </Stack>
    </Box>
  );
}
