# Atlas Prop Model Pipeline

## Current web delivery

Revision 0.8 keeps all six digital twins procedural in Three.js so the lab stays fast on a phone, has no paid asset dependency, and preserves selectable assembly parts:

- `shell`: protected EVA or foam structure
- `light`: diffused LED feedback
- `sensor`: IMU, Hall, or role input
- `core`: ESP32, connectors, and protected power
- `control`: deliberate player trigger
- `wearable`: grip, strap, or body-facing mount

The new detail pass fixes the first visual gate: every prop must be recognizable from its silhouette before electronics are shown.

## Free authored-model upgrade

[Blender](https://www.blender.org/) is the preferred authored-model tool because the official application is free and open source. Export each prop as glTF Binary (`.glb`) and load it through Three.js `GLTFLoader`.

Recommended authoring contract:

1. Model at real-world scale in metres.
2. Keep the six module names above as top-level object-name prefixes.
3. Use rounded, convention-safe silhouettes; no sharp contact geometry or working projectile mechanism.
4. Use one 1K texture set per prop for the mobile target.
5. Apply transforms and export Y-up glTF Binary.
6. Keep each hero prop below roughly 60k triangles for the web viewer; the Boss hammer and armour may share a 100k budget.
7. Verify the `.glb` in a standalone glTF viewer before replacing the procedural fallback.

## Upgrade order

| Priority | Prop | Authored-model focus |
| --- | --- | --- |
| 1 | Guardian Shield | real measurements, strap clearance, service hatch |
| 2 | Arc Bow | unmistakable recurve silhouette, one safe cosmetic string, enclosed riser electronics |
| 3 | Pulse Sword | foam blade thickness, protected LED channel, hand guard |
| 4 | Shade Daggers | paired holster fit, rounded tips, mirrored maintenance access |
| 5 | Lumen Staff | removable illuminated crystal and stable lower grip |
| 6 | Titan Warden | two-hand hammer balance and separate three-zone armour light rig |

Procedural models remain the fallback until a replacement passes silhouette, scale, mobile frame-rate, exploded-part selection, and physical-safety checks.
