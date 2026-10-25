# Lumen Staff and Dark Knight visual pass (Boss updated in CAD-03)

## Staff

Reference 140 × 1100 × 140 mm at 175 mm/display unit. Orb diameter is 140 mm; padded shaft follows the 40 mm CAD width. Outer diffuser remains visible when electronics are hidden; LED sits inside it. Upper-grip button, IMU below the upper grip and USB-first ESP32 in the lower grip are independent components. Lower end is a rounded padded sphere, replacing the pointed cap. Board/connector geometry is symbolic, not exact supplier CAD. No battery added.

## Boss

CAD-03: the Boss follows the game's phase-2 dark knight — a greatsword (820 mm blade, 360 mm guard, 1150 mm overall) at 175 mm/display unit; six hollow panels are the blade faces, blade edges and guard faces. Superseded CAD-02 hammer reference: 360 × 1150 × 180 mm. Six separate bevelled foam panels outline the hollow 360 × 180 × 180 mm head. Shaft is a separate padded shell, with two input triggers, a provisional balance-region IMU and lower-grip controller. Panel thickness and joins are illustrative, not a cutting plan or verified structure.

The bib is a separate assembly alongside the greatsword, with adjustable strap cues, a rear receiver and three individually named LED meshes: left-shoulder, chest, right-shoulder. Diffusers/cloth stay present when electronics are off. All belong to existing callout 6 / three-zone-armour; selection addresses the whole armour module. Displayed bib size is illustrative and does not imply one-size-fits-all. Greatsword envelope excludes armour.

Existing IDs, six model keys and ordered assembly mappings remain compatible. Neither model proves hit detection, balance, heat, current, wearer fit or structural safety. Unity remains authoritative; no physical striking.

## Validation

`validate-long-props.mjs` checks structural contracts with Three stubs. Repository, bilingual CAD, bow, blades, product engine and DOM regression checks pass. Real WebGL triangulation, appearance, transparency/occlusion and mobile performance still need browser inspection; browser/Three binaries remain unavailable locally.

Source-level visual upgrades now cover all six roles. This is not physical readiness. Next: full procurement records and exact guided PASS-gate adapters, then hardware evidence.
