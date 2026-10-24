# Arc Bow + Shared Impact Armour Proof 01

## Decision

The impact armour is not Boss-only. Hero and Boss use the same adjustable three-zone hardware. The game profile changes health, colour, phase, and haptic intensity.

## Authoritative hit path

1. The Arc Bow Hall sensor crosses the draw-ready threshold.
2. Release creates one `FIRE` event with a unique `shotId`.
3. An IR emitter broadcasts a short coded packet. It is invisible and does not create a visible energy projectile.
4. A receiver zone on the armour reports `SHOT_SEEN` and then `HIT_CONFIRM`.
5. The game rejects reused shot IDs and applies damage once.
6. Only the confirmed armour zone shows local light/haptic feedback.

Misses time out without damage. Bad codes produce `HIT_REJECT`. Duplicate delivery produces `DUPLICATE_IGNORED`.

## Linked component IDs

The source of truth is `dist/build-graph.js`. Its eight components connect purchase guidance, placement, wiring, assembly, and proof. Existing Arc Bow manifest IDs are retained. The IR emitter and armour receiver remain unverified additions until a real SKU is selected.

## Evidence boundary

Automated checks prove structure and deterministic logic only. They do not prove WebGL appearance, IR range, ambient-light immunity, receiver coverage, exact GPIO compatibility, battery life, heat, garment fit, impact safety, or field latency.

## Lowest-cost physical gate

Buy only one controller, one Hall sensor and magnet, one emitter/receiver pair, one short LED segment, USB power, wire, and cardboard/EVA for a three-zone bib. Run the bench and wearable tests in `dist/downloads/arc-bow-impact-armour-handoff.md` before final CAD, enclosures, or production printing.
