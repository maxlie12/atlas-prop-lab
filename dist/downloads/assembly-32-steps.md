# Spell Orb v1 — 32 Step Assembly Guide

## Prepare

1. Check every item against `docs/bom.md`.
2. Confirm the board is the MKE-K01 ESP32-S3 N4 (DevKitC-1 compatible) and photograph its printed pin labels.
3. Use USB power only for the first build.
4. Keep the ESP32 disconnected while wiring.
5. Place the ESP32 across the breadboard center gap.
6. Identify 5V, 3V3, GND, GPIO10, GPIO11, GPIO12, and GPIO13 on the printed labels.
7. Mark the CAST and SPECIAL buttons.
8. Place both buttons across the breadboard center gap.

## Wire inputs

9. Connect one CAST contact to GPIO10.
10. Connect the opposite CAST contact to GND.
11. Connect one SPECIAL contact to GPIO11.
12. Connect the opposite SPECIAL contact to GND.
13. Check that neither button connects 5V to GND.
14. Confirm the firmware uses `INPUT_PULLUP` for both buttons.

## Wire feedback

15. Place the passive buzzer on the breadboard.
16. Connect buzzer positive to GPIO13.
17. Connect buzzer negative to GND.
18. Place the 74AHCT125 level shifter across the center gap.
19. Connect the level shifter VCC to 5V and GND to GND.
20. Tie the selected channel enable pin low.
21. Connect GPIO12 to the selected level shifter input.
22. Connect its matching output through the 330 Ω resistor to LED ring DIN.
23. Connect LED ring VCC to 5V.
24. Connect LED ring GND to GND.
25. Place the 1000 µF capacitor across ring VCC and GND, matching polarity.

## Power and verify

26. Compare every wire with the pin table before connecting USB.
27. Check for loose strands and accidental shorts.
28. Connect the ESP32 to the computer with a data capable USB cable.
29. Build and upload `firmware/spell-orb` with PlatformIO.
30. Open serial monitor at 115200 baud and wait for `ATLAS_PROP_READY`.
31. Press CAST, then SPECIAL; verify JSON, LED color, sound, and cooldown rejection.
32. Disconnect USB, label the prototype revision, and record any wiring or behavior difference before enclosure work.

Stop power immediately if a part becomes hot, smells unusual, or the computer repeatedly disconnects the USB device.

