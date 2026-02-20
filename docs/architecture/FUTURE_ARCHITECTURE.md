# Future Architecture

## Objective

As more sessions come in, we want supervisors to trust this tool as a daily decision partner: fast when things are routine, clear when things are uncertain, and reliable when safety signals appear. The next phase focuses on reducing review friction, improving risk triage confidence, and keeping human judgment firmly in control.

## Target architecture (phased)

### Phase 1: Reliable synchronous baseline

- Keep current request-response analysis path for fast iteration.
- Improve reviewer clarity in the UI (why a session is flagged, what changed after review, what still needs action).
- Strengthen observability:
  - request IDs
  - latency histograms
  - parse error analytics
- Add request coalescing/distributed locking so concurrent analyze clicks for the same session do not trigger parallel model runs before the first write completes (this complements the existing idempotent read-check).

### Phase 2: Async analysis jobs

- Introduce `AnalysisJob` table:
  - `id`, `sessionId`, `status`, `attempt`, `startedAt`, `completedAt`, `errorCode`.
- API behavior:
  - `POST /analyze` enqueues job and returns `202` with job ID.
  - UI subscribes/polls job state.
- Worker behavior:
  - dequeue -> run model -> validate -> persist analysis -> emit status.

### Phase 3: Queue + worker scale-out

- Queue system: SQS, Cloud Tasks, or Redis-based queue.
- Dedicated worker service for analysis.
- Retry/backoff strategy with max-attempt threshold and dead-letter handling.

### Phase 4: Model governance

- Introduce prompt/model registry:
  - prompt version catalog
  - rubric version catalog
  - quality benchmark snapshots
- Add offline replay pipeline:
  - run historical transcripts against new prompts/models
  - compare precision/recall for risk and rubric consistency.

## Data and API evolution

- Add `analysisVersion` and `jobId` references to `AIAnalysis`.
- Store validation failures separately from transport errors.
- Add `reviewLatencyMinutes` metric for supervisor workflow KPIs.

## Reliability and safety controls

- Circuit breaker for model provider failures.
- Graceful degradation:
  - transcript view available even when analysis unavailable.
  - clear "analysis pending/failed" messaging.
- Supervisor review remains canonical even during AI downtime.

## Security and compliance direction

- Row-level ownership enforcement remains non-negotiable.
- Encrypt sensitive transcript data at rest and in transit.
- Add role-scoped audit logs for all review overrides.
- Add retention policy and redaction workflow for transcripts.

## Non-goals for this take-home

- Full multi-tenant partitioning.
- Realtime collaborative review.
- Human escalation integrations (SMS/call-center workflows).
