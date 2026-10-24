# Pulse Sword / Shade Daggers CAD-02

## Sword

Reference 110 × 650 × 45 mm; visual scale 100 mm/unit. Blade zone 450 mm, distinct foam guard, textured non-electronic grip, removable service cover, USB-first controller, guard IMU, grip trigger and actual wrist-loop mesh. The loop is an attached accessory outside the rigid body envelope. Painted EVA uses low metalness; it is not a metal blade.

## Daggers

Reference dimensions 75 × 320 × 40 mm per dagger; visual scale 50 mm/unit. Active dagger shell and passive off-hand dagger are separately selectable. Passive geometry is entirely non-electronic with a painted stripe, not an emissive LED. Only the active grip/guard contains ESP32, IMU and trigger. A separate strap/pad/button represents the wrist trap control; its non-electronic strap remains visible when electronics are hidden.

Original part IDs and callout numbers are retained. `passive-dagger` changes modelKey from the shared `shell` to `passive` to enable independent selection. Generated product adapters are refreshed from original role data. Role-specific eight-step highlight mappings replace the generic sequence for sword and daggers.

## Evidence boundary

Rounded tip paths use an 8 mm visual extent and two quadratic curves in both CAD and Three geometry; this is **not** a certified radius, material hardness or safety test. Do not strike people. Board sizes, covers, connector clearances, current, heat, durability and fit require actual measurements and physical tests. No battery or working wiring model was added.

Checks: blade geometry contract (Three stubs), repository consistency, bow regression, product engine adapters, UI DOM contracts and bilingual CAD generation. Real WebGL triangulation, appearance, occlusion and mobile rendering remain unverified because browser/Three binaries are unavailable here.
