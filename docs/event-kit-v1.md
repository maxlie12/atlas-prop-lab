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
| Boss | Titan Warden Hammer and LED armour | MPU6050, two grip triggers | SWEEP, SLAM, MARK, PHASE_SKILL |

## Titan Warden rationale

A two-handed hammer creates a boss silhouette that does not duplicate Guardian, remains legible in a small arena, and can express sweep, slam, charge, mark, and phase changes with one controller. Its head must be hollow EVA, the shaft fully padded, and every attack zero-contact.

The Boss wearable is an adjustable open-side training bib with removable front, shoulder, and rear LED zones. Unity owns Boss health and phase transitions. The wearable displays the authoritative result and never calculates damage.

## Recommended implementation order

1. Guardian Shield full build pack.
2. One real USB shield proof.
3. Unity serial bridge.
4. Archer Hall-sensor proof.
5. Mage and Warrior shared IMU controller.
6. Assassin input and virtual trap flow.
7. Titan Warden hammer and armour feedback.
8. Wireless proof and five-player load test.
9. Enclosures, charging, spares, pairing, operator recovery, and arena rehearsal.

## Current evidence boundary

The browser contains role concept drawings, planning BOMs, supplier references, sensor placement, downloadable role packs, and assembly order. The existing Spell Orb firmware compiles and its web files validate. No role prop, Boss armour, battery architecture, wireless path, Unity bridge, or full event kit is yet physically field verified.
