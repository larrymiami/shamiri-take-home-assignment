"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@mui/material";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <Button variant="outlined" onClick={handleSignOut} disabled={isPending}>
      {isPending ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
