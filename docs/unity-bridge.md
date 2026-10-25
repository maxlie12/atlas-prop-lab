# Unity bridge handoff

Copy `unity/Runtime` into the Unity project under an assembly that can reference `UnityEngine`.

## Boundary

The transport reads newline-delimited UTF-8 strings. Pass each complete line to `AtlasPropIntentRouter.PushLine`. The router validates protocol v1, resets a device on its `ATLAS_PROP_READY` banner or when its uptime goes backwards (reboot), rejects duplicate or stale sequence numbers, and raises `IntentAccepted` for `PLAYER_INTENT` and `ShotSeen` for armour `SHOT_SEEN`. It does **not** apply damage, block success, healing, score or cooldown; gameplay remains authoritative.

## Guardian mapping

| Physical intent | Unity command candidate | Authority check |
| --- | --- | --- |
| `BLOCK_START` | Begin block request | Player alive, stamina available, state permits blocking |
| `BLOCK_END` | End block request | End current block if owned by this player |
| `TAUNT` | Taunt request | Cooldown, phase and animation availability |

## Integration sketch

```csharp
private readonly AtlasPropIntentRouter _router = new();

void Awake()
{
    _router.IntentAccepted += e => commandBus.TryExecute(e.deviceId, e.action);
}

void OnSerialLine(string line)
{
    _router.PushLine(line);
}
```

The serial/WebSocket/ESP-NOW adapter belongs outside these classes. This keeps the same gameplay input boundary when transport changes.

## Project Atlas integration (Hardware Gate 01)

Project Atlas carries a copy of these three files in `Assets/_Project/Scripts/Props/`, plus:

- `AtlasPropCombatBridge`: maps `archer-bow-01` to the Archer seat (game Hero2; the old Gunner) and `impact-armour-01` to the Boss, confirms one hit per matching `FIRE` + `SHOT_SEEN` inside 1.5 s, and applies damage through `CombatActor.ApplyDamage`. It disables the mapped seat's scripted AI.
- `AtlasPropSerialTransport`: one background reader per COM port. Needs Api Compatibility Level **.NET Framework** (set for Standalone) because of `System.IO.Ports`. Close the browser bench page first; a COM port opens in one program at a time.
- `AtlasPropBridgeVerification.CliVerify`: edit-mode check of confirm, repeat, unknown, late, stale, silent-reboot and diagnostic lines.

Keep `unity/Runtime` here as the source and copy it over when it changes.

## Required tests in the Unity repository

1. Valid Guardian v1 event is accepted.
2. Same `deviceId + seq` is accepted only once.
3. Lower sequence is rejected as stale.
4. Unsupported version and `LOCAL_REJECT` are rejected.
5. `BLOCK_START` does not produce damage by itself.
6. Disconnect while blocking causes the session layer to release the block safely.

