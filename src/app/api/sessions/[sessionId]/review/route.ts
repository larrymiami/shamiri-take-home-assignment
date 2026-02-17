import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getSessionSupervisorId,
  submitSessionReview
} from "@/features/sessions/server/sessions.repository";
import { getCurrentSession } from "@/server/auth/session";
import { REVIEW_DECISION_VALUES, SESSION_STATUS_VALUES } from "@/server/types/domain";

interface ReviewRouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

const SupervisorReviewInputSchema = z
  .object({
    decision: z.enum(REVIEW_DECISION_VALUES),
    finalStatus: z.enum(SESSION_STATUS_VALUES),
    note: z
      .string()
      .max(1000, "Note cannot exceed 1000 characters")
      .transform((value) => value.trim())
  })
  .superRefine((value, ctx) => {
    // Enforce auditability: rejected/overridden decisions require rationale.
    if ((value.decision === "REJECTED" || value.decision === "OVERRIDDEN") && !value.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "A note is required when rejecting or overriding"
      });
    }
  });

export async function POST(request: Request, context: ReviewRouteContext) {
  const authSession = await getCurrentSession();

  if (!authSession?.user?.id || authSession.user.role !== "SUPERVISOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const supervisorIdForSession = await getSessionSupervisorId(sessionId);

  if (!supervisorIdForSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (supervisorIdForSession !== authSession.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SupervisorReviewInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid review payload",
        issues: parsed.error.flatten()
      },
      { status: 422 }
    );
  }

  try {
    const review = await submitSessionReview({
      sessionId,
      supervisorId: authSession.user.id,
      payload: parsed.data
    });

    // Keep page data in sync with the session status source of truth.
    revalidatePath("/dashboard");
    revalidatePath(`/sessions/${sessionId}`);

    return NextResponse.json({
      ok: true,
      sessionStatus: review.finalStatus,
      review
    });
  } catch (error) {
    console.error("Failed to submit session review", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
