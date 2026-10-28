# Hardware Gate 01 — Arc Bow + Shared Impact Armour

## Purpose

Turn the digital hit contract into a low-cost, measurable USB bench proof before batteries, custom PCBs, final CAD cavities, or finished shells are purchased.

## Reference stack

- Two MKE-K01 ESP32-S3 Dev Kit, N4 USB-C reference boards: one bow core (`firmware/arc-bow`) and one armour core (`firmware/impact-armour`), so receivers can sit 1–5 m from the emitter.
- KY-024/49E Hall module as a replaceable bench proxy. Its outputs must be metered before GPIO connection.
- Vishay TSAL6200 940 nm IR emitter through a transistor driver and current-limiting resistor.
- Vishay TSOP38238 38 kHz receiver with local supply filtering. A local HS0038B-class part is only a proxy.
- Breadboard, data-capable USB cable, jumper wires, and a multimeter.

The official Vishay and Espressif documentation is the electrical source of truth. Seller pages prove a purchase path, not electrical compatibility.

## Release sequence

1. Buy the USB bench items only.
2. Photograph exact markings and board pin labels.
3. Wire with power disconnected and clear all five wiring gates.
4. Flash `firmware/arc-bow` and `firmware/impact-armour`, connect both boards in desktop Chrome/Edge (**Connect bow** / **Connect armour**) so every trial is scored and hit latency is timed automatically.
5. Run 100 Hall draw/release trials and 100 hit packets, then export CSV. Mark an undetected release as MISS by hand.
6. Fit a cardboard/EVA bib to the smallest and largest expected wearer.
7. Run the 15-cell receiver matrix under expected event lighting.
8. Measure received parts and only then revise CAD cavities and enclosures.

## Non-negotiable boundaries

- ESP32-S3 logic is 3.3 V. No unmeasured 5 V signal may reach GPIO.
- The IR LED is transistor-driven; do not source its pulse current directly from GPIO.
- IR is invisible. Do not aim an unverified high-power optical emitter at eyes.
- No battery is used in Gate 01.
- Web PASS means workflow completeness. Hardware PASS exists only after real records are captured.
