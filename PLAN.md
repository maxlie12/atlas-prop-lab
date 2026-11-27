# Delivery Plan

## Goal

Prove the complete path from a physical action on an ESP32 prop to a game event that Project Atlas can consume, before buying a full set of hardware.

## Phases

1. **Affordable feedback proof:** validate `DRAW_READY → FIRE → IR_PACKET → HIT_CONFIRM → DAMAGE_APPLIED` with bow LEDs, sound, and three-zone shared Hero/Boss armour without a projector or camera. Digital logic complete; physical IR proof blocked.
2. **Role digital-twin lab:** six synchronized, silhouette-correct 3D prop profiles with PBR detail, exploded assembly layers, GPIO diagrams, event tests, Wokwi proxy, firmware baseline, browser arena replay, and build guide.
3. **Guardian production readiness:** fit-derived cardboard dimensions, five physical layers, staged purchases, 3D step synchronization, and evidence-gated release before final material spend.
4. **Reusable Atlas Core v1:** controller/proxy boundary, role harness contract, USB-first proof ladder, downloadable evidence pack, and one removable-core design are complete at planning level.
5. **Hardware proof:** receive one MKE-K01 reference unit and record its exact variant, pin labels, power, input, feedback, heat, and disconnect results.
6. **Unity bridge:** translate the serial or network event envelope into the existing Atlas command layer.
7. **Wireless proof:** test WiFi/WebSocket first, then test ESP-NOW if direct prop to hub communication is valuable.
8. **Role design packs:** Guardian shield, Warrior sword, Archer bow, Assassin daggers, Mage staff, and Dark Knight Boss greatsword/armour. Completed at concept and wiring-contract level; physical proof remains.
9. **Role hardware proofs:** build and verify each prop from the shared USB-first electronics contract.
10. **Event kit:** enclosures, charging, spare parts, pairing workflow, operator dashboard, and recovery procedures.

## Event Kit v1 target

- Roster: five available Hero kits, with any four loaded into a match, plus one Boss kit.
- MVP topology: one player core per active player plus one arena hub.
- Target arena: 6 × 8 m minimum play zone; 8 × 8 m preferred.
- Match target: 5–7 minutes.
- Safety boundary: no projectile and no physical strike; Unity remains authoritative.
- Build evidence: concept drawing, dimensions, BOM, supplier references, wiring, firmware profile, three-view guided assembly with PASS gates, simulator profile, and field QA.

## Exit criteria for the vertical slice

- CAST and SPECIAL generate stable, versioned JSON events.
- LED and buzzer feedback match cooldown state.
- Wokwi automation can exercise both buttons and assert serial output.
- The browser simulator demonstrates latency and packet loss effects.
- A first time builder can follow the 32 step guide.
- Selecting a role on Page 1 loads its exact parts, GPIO contract, and event names on Page 2.
- The browser can inspect every role as a lightweight 3D digital twin and replay the same field event envelope without becoming a second game engine.
- A Vietnamese or English reader can inspect every role and follow its eight-step drawing-linked assembly workflow.
- The bill of materials separates required and optional items.
- A first-time visitor can simulate draw, release, Unity validation, and one-zone Boss armour feedback without assuming a projector or camera.
- The planner clearly blocks stage-equipment spending until the physical feedback loop passes a real playtest.
- Atlas Core exposes a seven-gate evidence ladder and never presents the Wokwi DevKit proxy as the exact MKE-K01 physical pinout.

## Product engine proof — 2026-10-05

- Completed a separate VI/EN manifest playground: a STEM rectangular panel outside the six cosplay roles.
- Deterministic validation and JSON/SVG/Markdown generation; invalid input blocks export and edited input invalidates stale output.
- Concept envelope only; no AI research, embeddings, electrical simulation or manufacturing release. Existing role workflows are unchanged.
- Proof 2: published JSON Schema v1 and six role adapters with original IDs and eight VI/EN steps. Role previews reuse AtlasCad with locked dimensions; migrated lists are module groups, not complete purchase BOMs.
- Next: full procurement and detailed PASS-gate adapters, then source-backed research with human review.

## Visual pass CAD-02

- Arc Bow, Pulse Sword, Shade Daggers, Lumen Staff and the Boss (Dark Knight greatsword since CAD-03) now have source-level visual upgrades following Guardian's shell/electronics separation.
- Boss includes a separate illustrative three-zone bib and receiver; its wearable fit is not measured.
- Geometry and workflow contract tests pass. Rendered appearance and real hardware remain unverified.
- Next implementation: full purchase BOM and detailed guided PASS-gate adapters. Do not mark manufacturing-ready from these visual changes.

## Decisions held for real hardware testing

- ESP-NOW versus WiFi/WebSocket for the event venue.
- Battery capacity and charging architecture.
- Final enclosure, switches, connectors, and physical safety.
- Reliable radio range around people, costumes, props, and nearby WiFi networks.

## Prop teardown — revision 0.15

- Teardown READY for all six props: service-order steps drive the 3D twin (slide-out, focus glow, close-up camera) and a panel with every component's job, check, unit price range, gate tag and Shopee search link; totals per step, running and whole prop; `.md` export.
- Arc Bow twin now includes the Gate 01 IR emitter (lens tube on the arrow side) and the hit haptic; validators updated.
- Contract PASS: every mesh group of every model removed exactly once, catalogue complete and bilingual (`scripts/validate-teardown.mjs`); browser test 31/31 on desktop and phone.
- Prices are estimates checked 2026-11-25, shipping excluded; they are not quotes. Physical evidence remains EMPTY.

## Gate 01 hardware-ready — revision 0.14

- Assembly guide READY: 25 bilingual steps in delivery order with safety ordering validated (flash bare boards, short check before power, meter AO before GPIO, identify E-B-C and pinouts before wiring).
- Two-stage bench READY: campaign 01 can be recorded with only the bow core on the breadboard; campaign 02 still needs all five checks.
- Board check READY: identity, pin map and Hall rest level verified on connect; live Hall bar for magnet placement.
- Digital twin PASS: real bow + armour firmware through a receiver timing model — 100/100 bow, 100/100 hits at ~107 ms through the web judge; reflections, foreign codes, noise, release bounce and let-down covered. Decoder margin ≈ 195 µs edge jitter.
- Live/Replay READY: real lines drive the 3D arena; replays are rehearsals only. Bridge preview fixed for reboots and reused shot ids.
- Physical evidence remains EMPTY: nothing in this revision is a hardware measurement.

## Six-role sync — revision 0.13

- Gameplay roster READY: one roster for the field simulator, logic map, 3D arena and ESP32 lab; Hero seats 1–4 + reserve Warrior + Dark Knight, matching docs/unity-bridge.md and docs/event-kit-v1.md.
- Field simulator READY: real contract actions per role with press/release holds, the bridge's dedupe/stale/role/seat checks, the documented block/taunt/heal/team-shield values, the Arc Bow FIRE + SHOT_SEEN window, and unplug → seat AI.
- Role firmware WRITTEN: assassin-daggers, mage-staff, boss-greatsword, warrior-sword on the shared S3 pin map; host scenario tests PASS; ESP32 build runs in CI.
- Finding: a lost `BLOCK_END` over a lossy link leaves the block on; decide repeat-while-held or acknowledged release before the wireless proof (docs/field-simulator.md).
- Physical evidence remains EMPTY: IMU thresholds are starting values until measured on a real prop.

## Hardware Gate workflow — revision 0.12

- Purchase plan READY: one USB-only bench set with exact/datasheet-backed references and low-cost local proxy choices.
- Wiring workflow READY: editable provisional GPIO map, 3.3 V boundary, transistor-driven IR LED, per-receiver filtering, and five pre-power checks.
- Evidence workflow READY: 100 bow trials + 100 hit trials with strict 100/100 acceptance and timestamped CSV.
- Wearable workflow READY: smallest/largest wearer checks and 15-shot three-zone event-light coverage matrix.
- Physical evidence remains EMPTY until a real user buys the parts and performs the tests. This revision does not change manufacturing readiness.

## Arc Bow + shared armour status — revision 0.11

- Digital gate 1 PASS: guided product journey and saved progress.
- Digital gate 2 PASS: one shared armour contract with Hero/Boss profiles.
- Digital gate 3 PASS: eight linked components across buy/place/wire/assemble/prove.
- Digital gate 4 PASS: hit logic covers confirm, miss, reject, and duplicate events.
- Physical gate 5 BLOCKED: exact IR parts, GPIO, range, ambient light, fit, heat, power, and real latency are unverified.
