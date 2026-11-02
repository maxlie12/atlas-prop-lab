# Arc Bow / Armour — bench CSV evidence checker

This tool evaluates **measured** Arc Bow → IR receiver → armour hit trials, not simulator-generated claims. No hardware has been field-verified by this script.

## CSV

Columns (exact header):

```csv
trial_id,result,latency_ms
trial-001,PASS,42
trial-002,MISS,
trial-003,DUPLICATE,
trial-004,REJECT,
```

- `trial_id` must be unique and nonempty.
- `result` is PASS, MISS, DUPLICATE, or REJECT.
- `latency_ms` is required for PASS and must be empty otherwise. It's measured end-to-end timing, in milliseconds; record the measurement method in campaign notes.
- Preserve the original raw trial sheet and test conditions (distance, lighting, orientation, power source).

## Usage

```bash
node scripts/check-bench-evidence.mjs --self-test
node scripts/check-bench-evidence.mjs path/to/measured-trials.csv
node scripts/check-bench-evidence.mjs path/to/measured-trials.csv 100 150
```

Thresholds are **configurable provisional lab criteria**, not performance guarantees. Default sample size is 100, p95 <= 150 ms. A report's `readyForReview` means only that these basic checks passed; inspect MISS, DUPLICATE and REJECT counts before making any go/no-go decision. Returns exit code 2 for an unmet criterion, 1 for invalid input.

This does not validate electrical safety, emitter eye safety, false triggers, IR range, lighting resistance, GPIO wiring, garment fit, thermal performance, battery behavior, or impact protection. Use USB-only bench testing and the existing safety gates before wearable testing.
