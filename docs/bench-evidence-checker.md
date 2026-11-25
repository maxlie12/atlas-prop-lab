# Arc Bow / Armour — bench CSV evidence checker

`scripts/check-bench-evidence.mjs` evaluates **measured** Arc Bow → IR receiver → armour trials, not simulator-generated claims. No hardware has been field-verified by this script.

## Accepted CSV layouts

1. The web export from **Bench evidence → Download CSV** (one campaign per file), used as-is:

```csv
campaign,trial,outcome,latency_ms,source,note,recorded_at
hit,1,pass,108,serial,"shot 1 · chest (chest)",2026-11-25T02:00:00.000Z
hit,2,miss,,serial,"shot 2: no SHOT_SEEN within 400 ms",2026-11-25T02:00:02.000Z
```

2. A hand-made sheet:

```csv
trial_id,result,latency_ms
trial-001,PASS,42
trial-002,MISS,
```

Rules:

- `trial_id` (or `campaign` + `trial`) must be unique and nonempty.
- `result` / `outcome` is PASS, MISS, DUPLICATE, or REJECT (any case).
- Hit campaign: `latency_ms` is required for PASS and must be empty otherwise. Bow campaign (`campaign = bow`): there is no hit latency, so it may be empty.
- One campaign per file. `source` (serial / manual) is counted in the report.
- Preserve the original raw trial sheet and test conditions (distance, lighting, orientation, power source).

## Usage

```bash
node scripts/check-bench-evidence.mjs --self-test
node scripts/check-bench-evidence.mjs atlas-hit-bench-evidence.csv
node scripts/check-bench-evidence.mjs atlas-bow-bench-evidence.csv
node scripts/check-bench-evidence.mjs measured-trials.csv 100 150
```

`readyForReview` requires: at least 100 trials (configurable), at least one PASS, a **clean run** — zero MISS, DUPLICATE and REJECT, the same rule as the web panel — and, for the hit campaign, p95 latency ≤ 150 ms (configurable). Exit code 2 means a criterion is unmet, 1 means invalid input.

Thresholds are provisional lab criteria, not performance guarantees. This does not validate electrical safety, emitter eye safety, false triggers, IR range, lighting resistance, GPIO wiring, garment fit, thermal performance, battery behavior, or impact protection. Use USB-only bench testing and the safety gates before wearable testing.

`scripts/validate-ir-link.mjs` runs the self-test in CI and also scores the digital twin's simulated campaign to prove the checker reads the web format; simulated rows are never evidence.
