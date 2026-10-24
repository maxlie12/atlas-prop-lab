# Atlas Core v1

## Purpose

Atlas Core v1 is one removable, USB-first ESP32 electronics cartridge that can be reused across the Guardian shield, Warrior sword, Arc Bow, Assassin daggers, Mage staff, and Titan Warden controller. The controller and event envelope stay common; each prop gets a role-specific sensor, control, and feedback harness.

## Hardware and simulation boundary

- Physical reference: MKE-K01 ESP32-S3 N4. Confirm the exact module, USB connector, printed pin labels, dimensions, and vendor documentation on the delivered unit before wiring.
- Simulation proxy: Wokwi ESP32 DevKit V1. It proves firmware flow and event logic only. Its board shape and physical pin positions are not the MKE-K01 pinout.
- First power path: USB data and 5 V. Battery charging and wireless transport are deliberately deferred until the USB proof passes.
- GPIO values shown in the planner are candidate contracts. They become locked only after the delivered board is inspected and the relevant pins pass a minimal hardware test.

## Reusable layers

1. Controller: ESP32-S3, USB data, versioned firmware, device identity, and event envelope.
2. Carrier: removable enclosure, foam cradle, strain relief, labelled quick connectors, and a service opening.
3. Role harness: sensor, buttons or trigger, LEDs, and optional vibration or tone for one prop.
4. Game bridge: USB serial first; Unity remains authoritative for hit validation, cooldowns, damage, and match state.

## Proof ladder

1. Lock the reference controller and record the simulation boundary.
2. Receive and inspect the real board; photograph both sides and record the exact variant.
3. Prove USB boot and a stable 115200-baud ready message without reset loops.
4. Run 100 cycles of the selected role input and record misses or duplicates.
5. Run feedback for 10 minutes and record peak current and touch temperature.
6. Prove the Unity serial bridge receives the versioned events.
7. Fit the core into the prop only after connectors, strain relief, service access, and player safety pass.

## Safety and spending gates

- Do not add a battery, radio, projector, camera, or duplicated player cores before the USB event loop feels correct.
- Disconnect USB while changing wiring. Verify power and ground before every first connection.
- LEDs need a current budget, protected wiring, and a diffuser. Any haptic motor needs a suitable driver; it must not be driven directly from a GPIO.
- The web planner and Wokwi cannot certify heat, current, cable fatigue, RF range, enclosure fit, or body safety. Those remain physical tests.

## Next physical actions

1. Buy one reference controller and one USB data cable, not six role kits.
2. Inspect the delivered board and update the locked pin map from evidence.
3. Build the cheapest selected role input on a breadboard.
4. Capture serial logs for 100 cycles and record current and heat.
5. Connect that same event envelope to Unity.
6. Only then build the removable carrier and first prop harness.
