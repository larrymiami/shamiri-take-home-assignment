import { NextResponse } from "next/server";
import { listForSupervisor } from "@/features/sessions/server/sessions.repository";
import { parsePositiveInt, parseSessionStatusFilter } from "@/lib/searchParams";
import { getCurrentSession } from "@/server/auth/session";

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
    status: parseSessionStatusFilter(searchParams.get("status"))
  });

  return NextResponse.json(sessions);
}
