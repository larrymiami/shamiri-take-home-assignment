import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth/authOptions";

// Memoize per-request to avoid repeated session parsing in nested server components.
export const getCurrentSession = cache(async () => getServerSession(authOptions));

export async function requireSupervisorSession() {
  const session = await getCurrentSession();

  if (!session?.user?.id || session.user.role !== "SUPERVISOR") {
    redirect("/login");
  }

  return session;
}
