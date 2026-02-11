import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { SESSION_STATUS_VALUES } from "@/server/types/domain";
import { listForSupervisor } from "@/server/repositories/sessions.repo";
import type { SessionStatusFilter } from "@/server/types/sessions";

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

function parseStatusFilter(status: string | null): SessionStatusFilter {
  if (!status || status === "ALL") {
    return "ALL";
  }

  if (SESSION_STATUS_VALUES.includes(status as (typeof SESSION_STATUS_VALUES)[number])) {
    return status as SessionStatusFilter;
  }

  return "ALL";
}

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id || session.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessions = await listForSupervisor(session.user.id, {
    page: parsePositiveInt(searchParams.get("page"), 1),
    pageSize: parsePositiveInt(searchParams.get("pageSize"), 10),
    search: searchParams.get("q") ?? "",
    status: parseStatusFilter(searchParams.get("status"))
  });

  return NextResponse.json(sessions);
}
