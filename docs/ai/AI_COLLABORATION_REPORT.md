# AI Collaboration Report

## Why include this

The assignment explicitly asks for transparent human-AI collaboration. This document separates AI-assisted work from human-authored decisions and explains verification.

## AI-assisted areas

- Iterative prompt drafting and rubric wording refinement.
- Zod schema and structured output guardrail iterations.
- UI polish cycles for dashboard/session detail and responsive behavior.
- Playwright/Vitest scaffolding and flaky test debugging.
- Accessibility and copy refinement suggestions.

## Hand-written / human-owned decisions

- Domain model boundaries:
  - Supervisor/Fellow/Session/Analysis/Review relationships.
- Canonical status semantics:
  - `finalStatus` as source of truth.
  - `displayStatus` derivation precedence.
- Safety posture decisions:
  - explicit escalation policy
  - ambiguous-signal supervisor review path
- API contracts and ownership checks.
- Final tradeoff selections (on-demand analysis, strict JSON enforcement, review workflow).

## Verification process

- Static checks:
  - `pnpm typecheck`
  - `pnpm lint:ci`
- Automated tests:
  - `pnpm test:unit`
  - `pnpm test:e2e`
- Manual validation:
  - Dashboard filtering, status derivation, risk prioritization.
  - Analyze idempotency and review persistence flow.
  - Auth edge cases and unauthorized route behavior.

## Quality gates used before push

- All changed files pass lint/format.
- TypeScript compile passes without errors.
- Critical auth and workflow E2E path passes.
- Manual smoke walkthrough run on deployed app.

## Lessons learned

- AI output should be treated as untrusted until schema-validated.
- Prompt quality improved most when rubric criteria were explicit and bounded.
- Human review UX clarity matters as much as model quality for safe adoption.
