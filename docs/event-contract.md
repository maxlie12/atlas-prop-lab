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
| `seq` | Monotonic counter per boot, used to reject duplicates. |
| `type` | `PLAYER_INTENT` for accepted input. |
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

Local cooldown rejection is diagnostic output and must not enter gameplay:

```json
{"v":1,"deviceId":"hero-orb-01","type":"LOCAL_REJECT","action":"CAST","reason":"COOLDOWN","remainingMs":420}
```
