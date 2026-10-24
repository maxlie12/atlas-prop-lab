# Bill of Materials — Spell Orb v1

Prices are planning ranges in VND and should be checked again when ordering.

| Item | Qty | Required | Planning range | Reason |
| --- | ---: | :---: | ---: | --- |
| ESP32 DevKit V1, 30 pin | 1 | Yes | 90k–160k | Controller and future WiFi/ESP-NOW |
| WS2812B 16 LED ring, 5V | 1 | Yes | 45k–90k | Cooldown and player feedback |
| 12 mm momentary buttons | 2 | Yes | 10k–30k | CAST and SPECIAL inputs |
| Passive piezo buzzer | 1 | Yes | 5k–20k | Audio feedback |
| 74AHCT125 level shifter | 1 | Yes | 15k–40k | Reliable 3.3V to 5V LED data |
| 330 Ω resistor | 1 | Yes | 1k–5k | LED data line protection |
| 1000 µF capacitor, ≥6.3V | 1 | Yes | 5k–15k | Smooth LED supply spikes |
| Half size breadboard | 1 | Yes | 25k–55k | First assembly without soldering |
| Dupont jumper set | 1 | Yes | 25k–60k | Wiring |
| USB cable with data | 1 | Yes | 30k–100k | Programming and first test power |
| 5V USB power bank | 1 | Later | 180k–400k | Untethered field test |
| Prototype enclosure | 1 | Later | 50k–250k | Safe handheld use |
| USB power meter | 1 | Recommended | 80k–180k | Measure real current draw |

Expected bench prototype: **251k–575k VND**, excluding tools and optional enclosure/power bank.

The Wokwi diagram connects the LED data pin directly because the simulator uses ideal logic levels. Insert the 74AHCT125, resistor, and capacitor in the real build.

