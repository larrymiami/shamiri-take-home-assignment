# Cost Projection at Scale

## Purpose

Provide an order-of-magnitude estimate for AI analysis cost growth as session volume increases.

## Assumptions

- Model: `gpt-4o-mini`
- Analysis is on-demand and idempotent per session.
- Average effective transcript sent after windowing: 18k-22k characters.
- Response payload is compact structured JSON.
- Not every session is analyzed immediately.
- Illustrative price assumptions used in this sheet:
  - Input: `$0.15 / 1M tokens`
  - Output: `$0.60 / 1M tokens`

## Variables

- `S` = sessions per month
- `A` = analysis coverage ratio (0-1)
- `C_input` = average input tokens per analyzed session
- `C_output` = average output tokens per analyzed session
- `P_input`, `P_output` = model token prices

Estimated monthly AI cost:

`monthly_cost ~= S * A * ((C_input / 1_000_000) * P_input + (C_output / 1_000_000) * P_output)`

## Example scenarios (illustrative)

### Scenario A: Pilot region

- Sessions/month: 10,000
- Coverage: 40%
- Input tokens/session: 4,500
- Output tokens/session: 500
- Analyzed sessions/month: 4,000
- Estimated AI cost/month: **~$3.90** (or **~$4.68** with 20% retry overhead)

### Scenario B: Multi-site scale

- Sessions/month: 100,000
- Coverage: 60%
- Input tokens/session: 4,500
- Output tokens/session: 500
- Analyzed sessions/month: 60,000
- Estimated AI cost/month: **~$58.50** (or **~$70.20** with 20% retry overhead)

### Scenario C: National rollout

- Sessions/month: 1,000,000
- Coverage: 70%
- Input tokens/session: 4,500
- Output tokens/session: 500
- Analyzed sessions/month: 700,000
- Estimated AI cost/month: **~$682.50** (or **~$819.00** with 20% retry overhead)

## Cost levers

- Increase pre-filtering so only high-priority sessions are analyzed first.
- Keep transcript windowing aggressive while preserving safety recall.
- Cache immutable analyses and avoid re-computation.
- Route non-critical sessions to lower-cost models after benchmark validation.

## Operational recommendation

- Track `transcriptCharsSent`, `transcriptWasTruncated`, and per-run latency in production dashboards.
- Set monthly budget guardrails and throttle analysis queue if burn exceeds threshold.
