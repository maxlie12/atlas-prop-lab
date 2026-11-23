# Atlas Prop Lab

Atlas Prop Lab is a mobile friendly design and simulation workspace for the physical ESP32 props used by Project Atlas.

Revision 0.13 synchronizes **every gameplay character** and adds the missing role firmware:

- one gameplay roster (`dist/gameplay-roster.js`) shared by the field simulator, the logic map, the 3D arena and the ESP32 lab: Guardian, Archer, Assassin and Mage in Hero seats 1–4, the Warrior as the reserve kit, and the Dark Knight Boss
- every button sends that role's real contract actions (holds included: shield block, bow draw/release), with the game command and its Unity status (done / planned) on the button
- a DOM-free rule preview (`dist/field-sim.js`) of the Unity bridge: dedupe, stale, role mismatch, seat ownership, block 30 %, taunt 50 %, team shield 60 %, heal +10, Arc Bow `FIRE` + armour `SHOT_SEEN` confirm window, Boss phase charge, unplug → seat AI
- 3D arena figures that hold their CAD prop twins, with a Dark Knight wearing the three-zone bib that lights the zone the armour reports
- bench firmware for the Shade Daggers, Lumen Staff, Dark Knight greatsword and reserve Pulse Sword, plus host-compiled scenario tests for all role firmware ([docs/role-firmware.md](docs/role-firmware.md), [docs/field-simulator.md](docs/field-simulator.md))

Revision 0.12 adds a source-backed **physical hardware gate** to the guided Arc Bow + shared Hero/Boss impact-armour proof:

- a minimum USB-only bench kit with official datasheets, Vietnamese supplier references, receipt checks, and explicit deferred purchases
- an editable GPIO map with duplicate-pin blocking, an IR transistor driver, receiver filters, and five pre-power safety gates
- two persistent 100-trial evidence campaigns with PASS/MISS/DUPLICATE/REJECT, p95 latency, and CSV export
- shared-armour fit checks for the smallest/largest wearer plus a 15-shot, three-zone coverage matrix under event lighting
- a ten-step Start Product journey that links purchase, wiring, bench evidence, assembly, hit logic, fit, field acceptance, and handoff

Revision 0.11 added the digital contract underneath it:

- a persistent Start Product journey from design and purchase through bench, assembly, hit test, acceptance, and handoff
- one shared three-zone impact-armour contract for Hero and Boss gameplay profiles
- eight component IDs linked across purchase guidance, placement, wiring, assembly, and proof
- a deterministic `FIRE → IR_PACKET → HIT_CONFIRM → DAMAGE_APPLIED` lab with miss, reject, and duplicate protection
- a handoff panel that separates four passed digital gates from the blocked real-hardware gate

- an interactive `CHARGE → FIRE → HIT` proof at the top of the planner
- selectable left-shoulder, chest, and right-shoulder Boss armour feedback
- a clear three-level investment boundary: build now, optional event upgrade, and deferred stage edition
- an explicit no-projector/no-camera MVP contract before stage spending
- persistent per-prop 3D module selection, exploded-view level, electronics visibility, and assembly-sync preference
- stronger isolation and highlighting for every selectable 3D module

- five selectable hero builds: Guardian shield, Warrior sword, Archer bow, Assassin daggers, and Mage staff
- one Dark Knight Boss build (the game Boss's phase-2 form) with a two-handed foam greatsword and three-zone LED armour
- Vietnamese and English UI with a remembered language choice
- numbered concept drawings, sensor and core placement, role BOMs, supplier reference links, and ordered assembly paths
- an eight-step guided assembly mode for every role, with drawing highlights, required parts, expected result, PASS gate, and saved per-role progress
- three technical images per step: whole-prop location, numbered close-up, and expected post-step state
- downloadable Markdown build packs for every role
- an explicit evidence boundary between design-ready work and physical field verification
- a synchronized electronics profile for every shield, sword, bow, dagger, staff, and Boss build
- per-role component lists, GPIO diagrams, event test buttons, and downloadable configuration
- the shared 32-step USB-first electronics build moved into the ESP32 lab instead of a disconnected fourth page

The Wokwi/firmware baseline remains a reusable bench proxy while each physical role gets its own contract:

- ESP32-S3 DevKitC-1 (same GPIO contract as the MKE-K01 bench board)
- two simulator buttons that proxy the selected role's sensor events
- 16 pixel WS2812B LED ring
- passive buzzer feedback
- serial JSON event contract ready for a Unity bridge
- Wokwi circuit files and automated scenarios
- a browser field simulator for latency, packet loss, cooldowns, damage, and support healing
- a clear warning that IMU/Hall thresholds, current, heat, radio range, fit, and durability still require real hardware
- interactive Three.js digital twins for all six props, with orbit controls, exploded layers, electronics visibility, and selectable modules
- recognizable production-inspired silhouettes for the layered shield, pointed sword, single-string recurve bow, paired daggers, crystal staff, and two-handed Boss greatsword
- upgraded physically based materials, emissive LED channels, softened shadows, filmic tone mapping, fasteners, grips, guards, and protected electronics housings
- a Blender/glTF-ready model boundary: procedural web twins remain lightweight now and can later be replaced by authored `.glb` assets without changing the lab workflow
- a lightweight Three.js arena replay that visualizes the same latency/loss events as the existing field simulator without duplicating Unity gameplay
- a focused Guardian Shield fit calculator, five-layer construction contract, staged purchase checklist, five release gates, and downloadable measurement-aware production pack
- synchronization between the eight guided assembly steps and the Guardian 3D twin, including part highlight and exploded state

## Repository map

| Path | Purpose |
| --- | --- |
| `dist/` | Bilingual static mobile web lab and downloadable build packs |
| `dist/three-lab.js` | Three.js prop digital twins and lightweight arena event replay |
| `firmware/spell-orb/` | PlatformIO firmware for ESP32 |
| `firmware/<role>/` | Role firmware: guardian-shield, arc-bow, impact-armour, assassin-daggers, mage-staff, boss-greatsword, warrior-sword |
| `firmware/test/` | Host Arduino stand-ins and scenario tests for role firmware |
| `dist/gameplay-roster.js`, `dist/field-sim.js`, `dist/field-ui.js` | Shared gameplay roster, bridge rule preview and field simulator UI |
| `wokwi/` | Circuit diagram, simulator configuration, and scenarios |
| `docs/` | Architecture, bill of materials, event contract, and 32 step assembly guide |
| `docs/event-kit-v1.md` | Full event-kit target, role roster, Boss contract, and verification gates |
| `docs/role-build-contract.md` | Required output contract for every role-specific build pack |
| `docs/model-pipeline.md` | Free Blender-to-GLB upgrade contract and mobile model budgets |
| `docs/affordable-mvp-feedback-loop.md` | Camera-free Arc Bow to Boss armour feedback contract and purchase gate |
| `docs/arc-bow-impact-armour-proof-01.md` | Shared Hero/Boss armour decision, authoritative hit path, and physical proof boundary |
| `docs/field-simulator.md` | Synced field simulator: roster, controls, rule values and the wireless block finding |
| `docs/role-firmware.md` | Input → action mapping, thresholds and bench steps for daggers, staff, greatsword and sword |
| `scripts/validate-project.mjs` | Fast repository consistency checks |
| `.github/workflows/` | Firmware build, web validation, and optional Wokwi CI |

## Quick checks

```bash
node scripts/validate-all.mjs
```

To compile firmware with PlatformIO:

```bash
cd firmware/spell-orb
pio run
```

To run the Wokwi simulation from the repository root:

```bash
wokwi-cli . --scenario wokwi/scenarios/cast-and-special.yaml
```

Wokwi CI requires a repository secret named `WOKWI_CLI_TOKEN`.
