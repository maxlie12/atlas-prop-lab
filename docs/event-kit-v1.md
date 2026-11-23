# Atlas Event Kit v1

## Match target

- One Boss versus four active Heroes.
- Five Hero kits are available; the operator loads any four for a match.
- Match duration target: 5–7 minutes.
- Minimum play zone: 6 × 8 m; 8 × 8 m is preferred.
- MVP device topology: five player cores plus one arena hub.

## Role roster

| Role | Physical prop | Primary sensors | Versioned intent events |
| --- | --- | --- | --- |
| Guardian | Aegis Shield | MPU6050, thumb trigger | BLOCK_START, BLOCK_END, TAUNT |
| Warrior | Pulse Sword | MPU6050, index trigger | STRIKE, HEAVY_STRIKE, PARRY |
| Archer | Arc Bow, no projectile | Hall sensor, magnet, MPU6050 | DRAW_START, DRAW_READY, FIRE |
| Assassin | Active dagger, passive dagger, wrist button | MPU6050, grip trigger | QUICK_STRIKE, HEAVY_STRIKE, PLACE_TRAP |
| Mage | Lumen Staff | MPU6050, CAST/SPECIAL buttons | CAST_HEAL, CHANNEL, TEAM_SHIELD |
| Boss | Dark Knight Greatsword and LED armour | MPU6050, two grip triggers | SWEEP, SLAM, MARK, PHASE_SKILL |

## Dark Knight rationale

The prop follows the game Boss: an elf caster in phase 1 who becomes an armoured dark knight in phase 2. The two-handed greatsword is that knight's weapon, stays legible in a small arena, and expresses sweep, slam, mark and phase changes with one controller. The blade must be hollow EVA over a light spine with a rounded tip, the guard and pommel padded, and every attack zero-contact.

The Boss wearable is an adjustable open-side training bib with removable front, shoulder, and rear LED zones. Unity owns Boss health and phase transitions. The wearable displays the authoritative result and never calculates damage.

## Game seat mapping (Project Atlas)

One table both repos follow (decided 2026-10-24). Game asset ids stay as they are; display names follow this table.

| Project Atlas seat | Game asset id | Prop role | Physical prop | Status |
| --- | --- | --- | --- | --- |
| Hero 1 · Guardian | `guardian` | GUARDIAN | Aegis Shield | names match |
| Hero 2 · Archer (was Gunner) | `gunner` | ARCHER | Arc Bow | game renamed; sprite still shows a rifle until new archer art |
| Hero 3 · Assassin | `assassin` | ASSASSIN | Shade Daggers | names match |
| Hero 4 · Support | `support` | MAGE | Lumen Staff | same role; the staff matches the support art |
| Reserve Hero | — | WARRIOR | Pulse Sword | fifth kit; not yet a game seat |
| Boss · phase 1 elf → phase 2 dark knight | `boss_phase1` → `boss` | BOSS | Dark Knight Greatsword + shared armour | prop follows the game |

## Recommended implementation order

1. Guardian Shield full build pack.
2. One real USB shield proof.
3. Unity serial bridge.
4. Archer Hall-sensor proof.
5. Mage and Warrior shared IMU controller.
6. Assassin input and virtual trap flow.
7. Dark Knight greatsword and armour feedback.
8. Wireless proof and five-player load test.
9. Enclosures, charging, spares, pairing, operator recovery, and arena rehearsal.

## Current evidence boundary

The browser contains role concept drawings, planning BOMs, supplier references, sensor placement, downloadable role packs, and assembly order. The existing Spell Orb firmware compiles and its web files validate. No role prop, Boss armour, battery architecture, wireless path, Unity bridge, or full event kit is yet physically field verified.
