# Arc Bow CAD-02 visual model

- Replaces tubular limbs with a bevelled flat extrusion of the exact cubic front contour in `cad-lab.js`, at 150 mm/display unit.
- Reference envelope remains 430 × 900 × 60 mm. Bevels and decorative details are visualization, not cut geometry or manufacturing tolerances.
- Grip, wrap and service cover belong to shell; disabling electronics does not remove the grip.
- Six keys retain their manifest callouts: 1 shell, 2 cosmetic cord, 3 magnet/slider, 4 Hall board, 5 ESP32, 6 limb LEDs. Each mesh carries moduleId and callout metadata.
- One straight low-tension cosmetic cord. No arrow, rest, projectile or draw/release animation.
- Hall/magnet and controller details are symbolic: no exact board SKU geometry, verified slider mechanism, battery, wiring or electrical simulation added.
- Eight-step highlight mapping: shell, core, cord, Hall, core, LED, magnet, shell.

Validation: `node scripts/validate-bow-model.mjs`, repository consistency and CAD checks. Geometry contract uses stubs, so triangulation, rendered appearance and occlusion still need real Three.js/browser inspection. Browser binaries were unavailable in the execution environment.

Remaining props retain their prior models. Next visual pass: Warrior sword, then Assassin daggers, Mage staff and Boss hammer/armour.
