# Test Plan (Vitest + Playwright)

## Goals

- Validate core business rules for dashboard/session status derivation.
- Protect safety workflow behavior (RISK vs FLAGGED_FOR_REVIEW vs SAFE).
- Verify key supervisor journeys (login, dashboard access, session review flow).
- Create a repeatable baseline for PR checks and release confidence.

## Scope

- In scope:
  - Unit tests for pure logic and schema contracts (Vitest).
  - Browser-level journey tests for auth and primary supervisor pages (Playwright).
  - Manual exploratory passes using Playwright CLI workflow.
- Out of scope (initial setup):
  - Visual regression snapshots.
  - Full cross-browser matrix.
  - Load/performance benchmarking.

## Tooling

- Unit: `vitest` + `@vitest/coverage-v8`
- E2E: `@playwright/test` (Chromium project)
- Config:
  - `vitest.config.ts`
  - `playwright.config.ts`

## Test Pyramid

1. Unit tests (fast, high signal):
   - URL/query parsing
   - Status precedence and display mapping
   - AI analysis Zod contract and safety constraints
2. E2E tests (critical user journeys):
   - Login page rendering
   - Unauthenticated redirect to login
   - Optional authenticated sign-in + dashboard smoke

## Assignment Requirement Coverage Matrix

- Login flow:
  - E2E: login screen renders, authentication attempt flow.
- Dashboard listing:
  - E2E: dashboard reachable after auth.
  - Unit: status mapping logic that powers chips/filters.
- Session status semantics:
  - Unit: finalStatus precedence and AI fallback behavior.
  - Unit: `SAFE + requiresSupervisorReview => FLAGGED_FOR_REVIEW`.
- AI output contract:
  - Unit: `SessionAnalysisSchema` accepts/rejects expected payloads.
  - Unit: RISK requires supervisor review.

## CI Strategy

- Required on every PR:
  - `pnpm typecheck`
  - `pnpm lint:ci`
  - `pnpm test:unit`
- Optional gate (can be nightly or required once stable):
  - `pnpm test:e2e`

## Environment for E2E

- For local app startup inside Playwright:
  - Default uses `pnpm dev` via `playwright.config.ts`.
- For externally hosted environment:
  - Set `PLAYWRIGHT_BASE_URL` to skip local web server startup.
- For authenticated E2E:
  - Set `E2E_SUPERVISOR_EMAIL`
  - Set `E2E_SUPERVISOR_PASSWORD`

## Commands

- Unit:
  - `pnpm test:unit`
  - `pnpm test:unit:watch`
  - `pnpm test:coverage`
- E2E:
  - `pnpm test:e2e:install`
  - `pnpm test:e2e`
  - `pnpm test:e2e:headed`
  - `pnpm test:e2e:ui`
- Full:
  - `pnpm test:all`

## Playwright Skill Exploratory Workflow

- Pre-check:
  - `command -v npx`
- Setup wrapper:
  - `export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"`
  - `export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"`
- Example exploratory pass:
  - `"$PWCLI" open http://127.0.0.1:3000/login --headed`
  - `"$PWCLI" snapshot`
  - `"$PWCLI" fill eX "supervisor@shamiri.demo"`
  - `"$PWCLI" fill eY "Password123!"`
  - `"$PWCLI" click eZ`
  - `"$PWCLI" snapshot`
  - `"$PWCLI" screenshot`

## Next High-Value Tests to Add

1. Dashboard filters/pagination URL behavior (`q`, `status`, `page`).
2. Session detail:
   - Generate analysis success/failure states.
   - Review submit validation for reject/override note requirement.
3. API contract tests (route handlers with mocked auth/repositories).
4. CSV export hardening test (formula-injection sanitization).
