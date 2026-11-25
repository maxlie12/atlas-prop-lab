# Hardware Gate 01 — Arc Bow + Shared Impact Armour

## Purpose

Turn the digital hit contract into a low-cost, measurable USB bench proof before batteries, custom PCBs, final CAD cavities, or finished shells are purchased.

## Reference stack

- Two ESP32-S3 boards: one bow core (`firmware/arc-bow`) and one armour core (`firmware/impact-armour`), so receivers can sit 1–5 m from the emitter. The MKE-K01 ESP32-S3 Dev Kit N4 USB-C is the physical reference; an **ESP32-S3-DevKitC-1 clone (N8R2 / N16R8)** is accepted on the bench because it is the exact PlatformIO and Wokwi target (`board = esp32-s3-devkitc-1`). Its octal PSRAM uses GPIO35–37, which Gate 01 does not touch. On two-port boards, use the port labelled **COM/UART**: the firmware prints on `Serial` (UART0).
- KY-024/49E Hall module as a replaceable bench proxy, powered from 3V3. Its outputs must be metered before GPIO connection.
- Vishay TSAL6200 940 nm IR emitter through a transistor driver and current-limiting resistor.
- Vishay TSOP38238 38 kHz receiver with local supply filtering. A local HS0038B-class part is only a proxy.
- Breadboard, data-capable USB cable, jumper wires, and a multimeter.

The official Vishay and Espressif documentation is the electrical source of truth. Seller pages prove a purchase path, not electrical compatibility.

## Release sequence

Parts may arrive in two orders, so the bench opens in two stages. The web page **Gate 01 / Step by step** (`dist/gate01-assembly.js`) lists the 25 steps in this order, takes every GPIO from the wiring map, and exports a printable checklist.

1. **Order 1 — bow core.** Confirm both boards are ESP32-S3, photograph the pin labels, flash both firmwares while the boards are bare.
2. Wire the KY-024 (3V3, GND), check for shorts, meter AO ≤ 3.3 V, then connect AO.
3. In the wiring map tick checks 1, 2, 5 and **Stage 1 · bow core only** (no IR LED, transistor or receiver on the breadboard). This unlocks campaign 01 only.
4. Connect the bow in desktop Chrome/Edge. The page identifies the board from its `ATLAS_PROP_READY`/`ATLAS_PROP_INFO` line, checks its pins against the wiring map and warns about a rest level near 0/4095.
5. Use **Live Hall reading** to place the magnet (full draw clearly past READY, release below START) and **Re-measure rest**, then run 100 Hall draw/release trials. Mark an undetected release as MISS by hand; export CSV.
6. **Order 2 — IR parts.** Identify the transistor's E-B-C and the LED/receiver pins, build the emitter and receivers unpowered, re-check shorts, tick checks 3 and 4.
7. Connect both boards (either button: the page places each board by its identity), take one shot at 1 m, then run 100 hit packets and export CSV.
8. Check each CSV: `node scripts/check-bench-evidence.mjs atlas-hit-bench-evidence.csv` (accepts the web export as-is; see [bench-evidence-checker.md](bench-evidence-checker.md)).
9. Fit a cardboard/EVA bib to the smallest and largest expected wearer.
10. Run the 15-cell receiver matrix under expected event lighting.
11. Measure received parts and only then revise CAD cavities and enclosures.

## Bench commands

Both firmwares answer single characters over serial. Replies are text lines that never start with `{`, so JSON consumers (the Unity bridge, the bench judge) skip them.

| Board | Send | Reply |
| --- | --- | --- |
| Bow | `?` | `ATLAS_PROP_INFO v1 archer-bow-01 hall=4 ir=5 hallRest=2048 start=150 ready=600` |
| Bow | `h` | toggles `ATLAS_HALL raw=… rest=… dev=… state=rest\|drawing\|ready` at 10 Hz |
| Bow | `r` | re-measures the rest level (refused with `ATLAS_HALL_REST busy` while drawn) and answers with `ATLAS_PROP_INFO` |
| Armour | `?` | `ATLAS_PROP_INFO v1 impact-armour-01 zones=left:6,chest:7,right:8` |

`ATLAS_PROP_INFO` is an answer, not a reboot: only `ATLAS_PROP_READY` (printed once at boot) resets a device's sequence state.

## Digital twin (before the parts arrive)

`firmware/test/test_ir_link.cpp` runs the real `arc-bow` and `impact-armour` firmware together on one microsecond clock. The bow's 38 kHz bursts pass through a TSOP38238 timing model (output falls 105–184 µs after a burst starts, independently per receiver) into the armour's interrupt handlers. `scripts/validate-ir-link.mjs` then checks every printed line against the event contract, replays a 100-shot campaign through the web bench judge (`dist/bench-serial.js`) and scores the result with the CSV checker.

What it proves: both firmwares agree on framing and timing; a full draw fires exactly once (also with a reversed magnet, a release bounce or a partial let-down); one packet on two receivers is one shot; a reflection 180 ms later is `DUPLICATE_IGNORED`; a TV-remote NEC code is `HIT_REJECT`; receiver noise produces no shot; 100/100 draws give 100/100 hits at ~107 ms FIRE→`SHOT_SEEN`. The decoder still passes with up to ~195 µs of edge jitter, about 2.5× the model's spread.

What it does not prove: IR range, LED current, ambient-light immunity, the real receiver, the real Hall module or USB timing. Only the bench does.

## Rehearsal without hardware

- **Wokwi:** `wokwi-arc-bow.toml` (a slider stands in for the KY-024 AO, a visible LED for the IR LED) and `wokwi-armour.toml` (one Wokwi IR receiver on the chest pin plus a remote; a remote code is not an Atlas code, so expect `HIT_REJECT`). The CI scenario `wokwi/scenarios/arc-bow-draw-fire.yaml` runs only when the `WOKWI_CLI_TOKEN` secret is set and has not been run yet.
- **Replay:** the field simulator's **Replay log** mode plays a saved Serial Monitor log (PlatformIO `monitor_filters = time` is enabled for both projects) through the game rules and a rehearsal bench judge that never writes evidence ([field-simulator.md](field-simulator.md)).

## Non-negotiable boundaries

- ESP32-S3 logic is 3.3 V. No unmeasured 5 V signal may reach GPIO.
- The IR LED is transistor-driven; do not source its pulse current directly from GPIO.
- IR is invisible. Do not aim an unverified high-power optical emitter at eyes.
- No battery is used in Gate 01.
- Web PASS means workflow completeness. Hardware PASS exists only after real records are captured; a digital-twin or replay PASS is never hardware evidence.
