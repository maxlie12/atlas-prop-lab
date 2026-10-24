# Unity bridge handoff

Copy `unity/Runtime` into the Unity project under an assembly that can reference `UnityEngine`.

## Boundary

The transport reads newline-delimited UTF-8 strings. Pass each complete line to `AtlasPropIntentRouter.PushLine`. The router validates protocol v1 and rejects duplicate or stale sequence numbers. It does **not** apply damage, block success, healing, score or cooldown; gameplay remains authoritative.

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

## Required tests in the Unity repository

1. Valid Guardian v1 event is accepted.
2. Same `deviceId + seq` is accepted only once.
3. Lower sequence is rejected as stale.
4. Unsupported version and `LOCAL_REJECT` are rejected.
5. `BLOCK_START` does not produce damage by itself.
6. Disconnect while blocking causes the session layer to release the block safely.

