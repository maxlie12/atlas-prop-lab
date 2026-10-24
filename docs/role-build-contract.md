# Atlas Role Build Pack Contract

Every playable prop must ship the same evidence set. Concept art alone is not a build pack.

## Required outputs

1. Front, rear, cross-section, and exploded assembly drawings.
2. Dimensions in millimetres and a printable foam cutting template.
3. Bill of materials with quantity, stage, supplier reference, planning price, and at least one substitute for critical electronics.
4. ESP32 pin map, sensor orientation, connector plan, and removable service-module position.
5. Firmware profile and versioned Atlas event names.
6. Wokwi circuit or an explicit simulator limitation when a physical sensor cannot be modelled faithfully.
7. Ordered USB-first assembly steps in Vietnamese and English. Each step identifies its drawing callout, required parts, action, expected result, and a PASS condition.
8. Calibration procedure for at least three users.
9. False-trigger, heat, power, disconnect, comfort, and field-safety checklist.
10. Unity device profile and an end-to-end PASS/FAIL report.

## Source states

- **Reference:** a search or marketplace listing; stock and dimensions must be rechecked.
- **Selected:** exact SKU chosen for the first build.
- **Purchased:** order evidence exists.
- **Bench verified:** wired device and firmware pass over USB.
- **Field verified:** human-use, wireless, power, and safety evidence exists.

The tool must never present a Reference item as Purchased or a concept drawing as Field verified.

## Guided assembly state

- A builder may preview every step before buying parts.
- Completion cannot be recorded until the builder confirms that the required parts were checked.
- Progress is stored independently for each role build.
- Highlighted drawing callouts must match the physical area changed by the current step.
- Every step provides three synchronized visual states: whole prop, close-up location, and expected result after the step.
- A checked step records self-attested progress only; it does not replace bench or field verification evidence.

## Shared safety boundary

- Props send player intent; Unity decides damage, healing, score, and win conditions.
- No arrows, projectiles, sharpened parts, metal blade cores, or intentional player contact.
- Hard electronics and batteries live inside removable protected service modules.
- First power-up uses USB. Battery selection remains blocked until a real current and heat test is recorded.
