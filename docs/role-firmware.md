# Role firmware — Assassin, Mage, Dark Knight, Warrior

Revision 0.13 adds bench firmware for the four props whose game commands were already mapped in [unity-bridge.md](unity-bridge.md) but had no device code. All four follow the Guardian Shield pattern: MKE-K01 ESP32-S3 core, shared S3 pin map, USB serial, contract-v1 lines from [event-contract.md](event-contract.md), and a local cooldown that prints a diagnostic `LOCAL_REJECT` instead of a gameplay event.

| Prop | deviceId | Firmware | Inputs (GPIO) |
| --- | --- | --- | --- |
| Shade Daggers | `assassin-daggers-01` | `firmware/assassin-daggers` | IMU SDA/SCL 1/2 · grip trigger 10 · wrist trap button 11 · status LEDs 12 |
| Lumen Staff | `mage-staff-01` | `firmware/mage-staff` | IMU 1/2 · CAST 10 · SPECIAL 11 · orb LEDs 12 · vibration driver 13 |
| Dark Knight greatsword | `boss-greatsword-01` | `firmware/boss-greatsword` | IMU 1/2 · primary trigger 10 · secondary trigger 11 · blade LEDs 12 |
| Pulse Sword (reserve) | `warrior-sword-01` | `firmware/warrior-sword` | IMU 1/2 · index trigger 10 · spine LEDs 12 · vibration driver 13 |

`scripts/validate-s3-pins.mjs` fails if a firmware uses a GPIO its electronics profile in `dist/app.js` does not document, or prints a different deviceId.

## Input → action

| Prop | Player does | Line sent | Local lock (game keeps its own) |
| --- | --- | --- | --- |
| Daggers | Hold grip + stab (peak ≥ 15 m/s²) | `QUICK_STRIKE` | 250 ms |
| Daggers | Hold grip + hard lunge (peak ≥ 24 m/s²) | `HEAVY_STRIKE` (game dashes, then attacks) | 4 s |
| Daggers | Press the wrist pad | `PLACE_TRAP` | 8 s |
| Staff | Tap CAST (< 600 ms), sent on release | `CAST_HEAL` | 4 s (= game) |
| Staff | Hold CAST ≥ 600 ms, sent once while held | `CHANNEL` (staff bolt) | 1.2 s |
| Staff | Press SPECIAL | `TEAM_SHIELD` | 14 s (= game) |
| Greatsword | Hold primary + swing (≥ 17 m/s²) | `SWEEP` | 1.5 s |
| Greatsword | Hold both triggers + swing | `SLAM` | 3 s |
| Greatsword | Tap secondary alone (< 300 ms) | `MARK` | 1 s |
| Greatsword | Hold both triggers still for 1.5 s | `PHASE_SKILL` (the game decides if charged) | 3 s |
| Sword | Hold index trigger + swing (≥ 16 m/s²) | `STRIKE` | 300 ms |
| Sword | Hold index trigger + hard swing (peak ≥ 26 m/s²) | `HEAVY_STRIKE` | 4 s |
| Sword | Quick trigger tap (< 250 ms) without a swing | `PARRY` | 2 s |

A swing is classified once, at its end (or after its maximum window), from the peak acceleration magnitude, so one movement can never send both a light and a heavy action. If the IMU is missing at boot, the READY banner says so and the main trigger alone sends the light action, so the USB bench proof still runs.

## Host tests (no board needed)

`firmware/test/host/` holds small Arduino, Wire, NeoPixel and MPU6050 stand-ins. `scripts/validate-firmware-host.mjs` compiles each role firmware with `g++`/`clang++`, drives its buttons and IMU through scripted scenarios (including bounce, cooldown and the disambiguation cases above), and checks every printed line against the contract: `v`, deviceId, role, monotonic `seq`, allowed action, well-formed `LOCAL_REJECT`. It skips with a message on a machine without a C++ compiler; CI runs it on ubuntu-latest. The ESP32-S3 build itself stays in `.github/workflows/firmware.yml`.

## First bench proof per prop

1. Flash over USB, open the serial monitor at 115200 and confirm the `ATLAS_PROP_READY v1 <deviceId> imu=ready` banner.
2. Exercise every row of the table above 20 times; every attempt must print exactly one line and nothing else.
3. Record false triggers while walking, turning and resting the prop for 5 minutes: the target is zero.
4. Tune the thresholds in `namespace Thresholds` on the real IMU mount, then re-run steps 2–3 and keep the numbers in the build log.

## Not yet proven

Thresholds are starting values chosen for a guard-mounted MPU6050; they are unmeasured on a real prop, wearer or arena. Battery, wireless transport, heat and drop tests remain open, exactly as for the Guardian Shield.
