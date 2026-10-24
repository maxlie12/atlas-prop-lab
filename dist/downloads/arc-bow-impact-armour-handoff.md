# Atlas Prototype 01 — Arc Bow + Shared Impact Armour

Status: **4/5 digital gates passed; physical proof blocked**.

This pack is a prototype handoff, not a manufacturing release or field certification.

## What is ready

- A start-to-finish product journey with saved local progress.
- One shared three-zone impact armour contract for Hero and Boss profiles.
- Eight linked component records across purchase, placement, wiring, assembly, and proof.
- A deterministic hit-flow simulator with confirm, miss, reject, and duplicate-packet paths.
- A no-projectile Arc Bow boundary and no-camera MVP path.

## What must be physically proven

- [ ] Confirm the exact ESP32-S3 board variant and photograph its pin labels.
- [ ] Select one IR emitter/receiver pair; record wavelength, carrier, voltage, and current.
- [ ] Run 100 Hall-sensor draw/release cycles and count missing or duplicate FIRE events.
- [ ] Run 100 coded hit packets under indoor event lighting.
- [ ] Test direct, angled, partly covered, and out-of-range shots.
- [ ] Confirm one shot ID can apply damage no more than once.
- [ ] Wear the bib on the smallest and largest intended user; record fit and exposed receiver area.
- [ ] Run for 30 minutes; measure heat, battery voltage, disconnects, and latency.
- [ ] Measure bought boards and connectors before editing final CAD cavities.

## Release rule

Do not order finished shells or production 3D prints until the USB bench test and wearable hit test pass. Cardboard/EVA mock-ups are the correct first physical build.
