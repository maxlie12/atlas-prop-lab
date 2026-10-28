# Atlas Prop Event Contract v1

Every accepted physical action becomes one newline terminated JSON object.

```json
{
  "v": 1,
  "deviceId": "hero-orb-01",
  "role": "ARCHER",
  "seq": 17,
  "type": "PLAYER_INTENT",
  "action": "CAST",
  "atMs": 18342
}
```

## Fields

| Field | Rule |
| --- | --- |
| `v` | Protocol version. Reject unsupported major versions. |
| `deviceId` | Stable ID assigned during kit setup. |
| `role` | `GUARDIAN`, `WARRIOR`, `ARCHER`, `ASSASSIN`, `MAGE`, or `BOSS`. |
| `seq` | Monotonic counter per boot, used to reject duplicates. A lower `seq` with a lower `atMs`, or an `ATLAS_PROP_READY` banner, means the device rebooted and its counter restarts. |
| `type` | `PLAYER_INTENT` for accepted input; `SHOT_SEEN` for an armour receiver report. |
| `action` | A role action from the locked profile, such as `BLOCK_START`, `FIRE`, `CAST_HEAL`, or `SLAM`. |
| `atMs` | Device uptime when the input was accepted. |

## Unity bridge rules

1. Parse complete newline terminated frames.
2. Validate required fields and protocol version.
3. Deduplicate by `deviceId + seq`.
4. Map the event to the current player session.
5. Let the authoritative game state accept or reject the action.
6. Return an acknowledgement for accepted, rejected, and stale events once wireless transport is introduced.

## Role action sets

| Role | Actions |
| --- | --- |
| Guardian | `BLOCK_START`, `BLOCK_END`, `TAUNT` |
| Warrior | `STRIKE`, `HEAVY_STRIKE`, `PARRY` |
| Archer | `DRAW_START`, `DRAW_READY`, `FIRE` |
| Assassin | `QUICK_STRIKE`, `HEAVY_STRIKE`, `PLACE_TRAP` |
| Mage | `CAST_HEAL`, `CHANNEL`, `TEAM_SHIELD` |
| Boss | `SWEEP`, `SLAM`, `MARK`, `PHASE_SKILL` |

## Hardware Gate 01 — Arc Bow and impact armour

`firmware/arc-bow` adds `shot` (1–255, the coded IR packet id) to `DRAW_START`, `DRAW_READY` and `FIRE`:

```json
{"v":1,"deviceId":"archer-bow-01","role":"ARCHER","seq":3,"type":"PLAYER_INTENT","action":"FIRE","shot":7,"hall":712,"atMs":1500}
```

`firmware/impact-armour` reports the first zone that decoded that packet (all zones that saw it within 40 ms are listed):

```json
{"v":1,"deviceId":"impact-armour-01","role":"ARMOUR","seq":1,"type":"SHOT_SEEN","atMs":900,"shot":7,"shooter":1,"zone":"chest","zones":["chest","left"]}
```

The armour never decides damage. The game confirms `HIT_CONFIRM` only when a `SHOT_SEEN` matches an open `FIRE` with the same `shot` inside its confirm window, once per shot. `HIT_REJECT` (invalid code) and `DUPLICATE_IGNORED` are diagnostics.

Local cooldown rejection is diagnostic output and must not enter gameplay:

```json
{"v":1,"deviceId":"hero-orb-01","type":"LOCAL_REJECT","action":"CAST","reason":"COOLDOWN","remainingMs":420}
```
