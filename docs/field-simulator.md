# Field simulator v2 — synced gameplay roster

The browser field simulator now uses the same six characters, props, device IDs and contract actions as the Unity bridge ([unity-bridge.md](unity-bridge.md)) and Event Kit v1 ([event-kit-v1.md](event-kit-v1.md)). It is a replay of the event path, not a second game engine: no movement, pathing or physics, and Unity stays authoritative.

| File | Role |
| --- | --- |
| `dist/gameplay-roster.js` | The roster: Hero 1–4 seats plus the reserve kit, each action's events, game command, Unity status (done / planned) and rule values |
| `dist/field-sim.js` | Pure rules, no DOM: device-side line builder and game-side bridge (dedupe, stale, role mismatch, unknown action, seat ownership, readiness) plus a light rule preview |
| `dist/field-ui.js` | Buttons with real press/release, latency and loss per line, event log, logic map, party HP, reserve swap, unplug → AI |
| `dist/three-lab.js` (arena) | Rigged characters holding their CAD prop twins, Dark Knight with the three-zone bib, effects per action |
| `dist/field-live.js` | Signal source: Simulation, Real boards (Live) or Replay log; log parsing, two-board timeline and a rehearsal bench judge |

## Lineup

Hero 1 Guardian · Hero 2 Archer · Hero 3 Assassin · Hero 4 Mage, Boss = Dark Knight. The Warrior is the fifth (reserve) kit and may take a melee seat (Hero 1 or Hero 3); its game commands are still planned, so its buttons are marked "Planned in Unity".

## What each control sends

| Character | Control | Lines |
| --- | --- | --- |
| Guardian | Hold Block / release · Taunt | `BLOCK_START` … `BLOCK_END` · `TAUNT` |
| Archer | Hold to draw, release to shoot | `DRAW_START`, `DRAW_READY` after 450 ms, `FIRE` with `shot`; letting go earlier sends no FIRE. The impact armour then reports `SHOT_SEEN` on its own link. |
| Assassin | Quick strike · Dash strike · Trap | `QUICK_STRIKE` · `HEAVY_STRIKE` · `PLACE_TRAP` |
| Mage | Heal · Staff bolt · Team shield | `CAST_HEAL` · `CHANNEL` · `TEAM_SHIELD` |
| Warrior | Strike · Heavy · Parry | `STRIKE` · `HEAVY_STRIKE` · `PARRY` |
| Dark Knight | Sweep · Slam · Mark · Phase skill | `SWEEP` · `SLAM` · `MARK` · `PHASE_SKILL` |

Keys 1–4 press the selected character's buttons (holds work with the key held).

## Rule preview

Values from the Unity notes: block takes 30 %, taunt makes the Boss deal 50 % to everyone but the Guardian for 4 s (8 s cooldown), heal +10 to the most-wounded ally below 85 % (4 s), team shield takes 60 % for 3 s (14 s), the Arc Bow hit is confirmed only when a `SHOT_SEEN` matches an open `FIRE` within 1.5 s, once per shot; a report that arrives first is held, and an unmatched shot expires as `expired_no_hit`. `PHASE_SKILL` is refused until charged. Every other damage number is a browser placeholder. Range checks (5 m, 6 m) are listed but assumed satisfied, because the game's seat AI keeps allies grouped.

`scripts/validate-field-sim.mjs` checks these rules and that every roster action and device ID exists in the contract and bridge docs.

## Finding: a lost BLOCK_END leaves the block on

With packet loss above 0 %, a lost `BLOCK_END` keeps the Guardian blocking until the next shield line, because nothing repeats or times out a held state. USB serial does not lose lines, so this only matters once wireless arrives. Before the wireless proof, pick one: the shield repeats its held state (for example every 250 ms while held) and the game releases the block when the repeats stop, or the game acknowledges `BLOCK_END` and the shield resends until acknowledged (contract rule 6). The Archer's draw has the same shape but is harmless, because `DRAW_*` is presentation only.

## Signal source — Simulation, Real boards, Replay (revision 0.14)

The telemetry panel's **Signal source** decides where lines come from:

| Mode | Lines | Notes |
| --- | --- | --- |
| Simulation | Buttons / keys 1–4 | Latency and loss come from the sliders. |
| Real boards | `archer-bow-01` and `impact-armour-01` over the Web Serial ports opened on the bench page | No artificial latency or loss: a real draw/release and a real hit damage the Boss in 3D. The Archer's buttons are refused while a real bow drives the seat. The first real line switches the field to this mode automatically. **Download session log** saves every line with a host timestamp. |
| Replay log | A pasted Serial Monitor log | Formats: PlatformIO `monitor_filters = time` (`14:02:02.294 > …`), Arduino IDE (`… -> …`), the digital twin (`LINE bow <µs> …`) or bare lines. Two boards are put on one timeline; untimed lines use each board's own `atMs`. A rehearsal copy of the bench judge scores the replay (bow PASS, hits, misses, rejects, p95) and **never** writes hardware evidence. **Sample log** contains a chest hit, a two-zone hit, a reflection, a TV-remote code, an out-of-range miss and a final hit. |

Bridge rules that real lines exposed, now in `dist/field-sim.js`:

- **Reboot:** a lower-or-equal `seq` with a lower `atMs` is a reboot (docs/event-contract.md), not a stale line; `resetDevice()` does the same for an `ATLAS_PROP_READY` banner.
- **Shot ids repeat:** `shot` is 1–255 and restarts when the bow reboots. A `SHOT_SEEN` is a duplicate only inside the confirm window, like `AtlasPropCombatBridge` ("one hit per matching `FIRE` + `SHOT_SEEN` inside 1.5 s"); a bow reboot also clears its in-flight shots. Before this change the simulator remembered confirmed ids forever and refused every hit after a bow reboot.

`scripts/validate-field-live.mjs` covers the four log formats, the timeline, the rehearsal judge on the sample, bridge damage, the reboot rule, shot-id reuse and the evidence boundary.
