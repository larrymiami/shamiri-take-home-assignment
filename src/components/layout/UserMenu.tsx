"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { Avatar, Box, Divider, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";

interface UserMenuProps {
  name: string;
  email: string;
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPending, startTransition] = useTransition();
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    startTransition(async () => {
      handleClose();
      await signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : undefined}
        aria-label="Open account menu"
        sx={{ p: 0.25, border: "1px solid", borderColor: "divider" }}
      >
        <Avatar sx={{ width: 34, height: 34, bgcolor: "#d9dded", color: "primary.main" }}>
          {name.charAt(0)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        keepMounted
        // Prevent body scroll-lock width compensation from shifting the app bar.
        disableScrollLock
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack spacing={0.2}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{name}</Typography>
            <Typography sx={{ fontSize: 12 }} color="text.secondary">
              {email}
            </Typography>
          </Stack>
        </Box>
        <Divider />
        <MenuItem onClick={handleSignOut} disabled={isPending}>
          {isPending ? "Signing out..." : "Sign out"}
        </MenuItem>
      </Menu>
    </>
  );
}
