# Unity bridge handoff

Copy `unity/Runtime` into the Unity project under an assembly that can reference `UnityEngine`.

## Boundary

The transport reads newline-delimited UTF-8 strings. Pass each complete line to `AtlasPropIntentRouter.PushLine`. The router validates protocol v1, resets a device on its `ATLAS_PROP_READY` banner or when its uptime goes backwards (reboot), rejects duplicate or stale sequence numbers, and raises `IntentAccepted` for `PLAYER_INTENT` and `ShotSeen` for armour `SHOT_SEEN`. It does **not** apply damage, block success, healing, score or cooldown; gameplay remains authoritative.

## Role action map (all six roles)

MVP control split (decided 2026-10-27): the seat's scripted AI keeps **moving and aiming**; the prop only decides **when** an ability fires, and owns only the abilities it has actions for. The Arc Bow takes over the Archer's ranged shot; the Guardian shield takes block and taunt while the AI keeps the Guardian's ordinary attacks. A prop that disconnects hands its abilities back to the AI and never leaves a held state (block) stuck on. Every command still passes the game's own checks (alive, cooldown, engagement started, not winding up). Only the Arc Bow has a physical hit confirmation (IR); melee and spell hits are resolved by the game's range/cone checks at the moment the prop fires.

| Prop role | Game seat | Action | Game command (Project Atlas `CombatActor`) | Status |
| --- | --- | --- | --- | --- |
| Archer | Hero (Archer) | `DRAW_START` | Presentation only (draw telegraph) | Accepted, no gameplay effect |
| Archer | Hero (Archer) | `DRAW_READY` | Presentation only (ready cue) | Accepted, no gameplay effect |
| Archer | Hero (Archer) | `FIRE` | Opens shot; `SHOT_SEEN` match → `ApplyDamage` on the armour wearer | **Done** (`AtlasPropCombatBridge`) |
| Guardian | Hero (Guardian) | `BLOCK_START` | `BeginBlock`: hits from within 75° of the aim take 30% (sourceless/trap damage is not blocked) | **Done** |
| Guardian | Hero (Guardian) | `BLOCK_END` | `EndBlock`; also forced on shield disconnect or reboot | **Done** |
| Guardian | Hero (Guardian) | `TAUNT` | `TriggerTaunt`: nearest opponent within 6 m deals 50% to everyone but the Guardian for 4 s; 8 s cooldown | **Done** |
| Warrior (reserve) | Hero (any melee seat) | `STRIKE` | `TriggerAttack` | Planned |
| Warrior (reserve) | Hero (any melee seat) | `HEAVY_STRIKE` | `TriggerHeavyBlast` | Planned |
| Warrior (reserve) | Hero (any melee seat) | `PARRY` | **New:** short block window (shares Guardian block) | Planned |
| Assassin | Hero (Assassin) | `QUICK_STRIKE` | `TriggerAttack` | **Done** |
| Assassin | Hero (Assassin) | `HEAVY_STRIKE` | `TriggerDash` along the aim (if off cooldown), then `TriggerAttack` | **Done** |
| Assassin | Hero (Assassin) | `PLACE_TRAP` | `TriggerTrap` | **Done** |
| Mage | Hero (Support) | `CAST_HEAL` | `SimpleScriptedCombatController.TryHealAlly`: most-wounded ally below 85% within 5 m, +10, 4 s cooldown | **Done** |
| Mage | Hero (Support) | `CHANNEL` | `TriggerProjectile` (staff bolt) | **Done** |
| Mage | Hero (Support) | `TEAM_SHIELD` | `TriggerTeamShield`: allies within 5 m (Mage included) take 60% for 3 s; 14 s cooldown | **Done** |
| Boss | Boss | `SWEEP` | `TriggerHeavyBlast` (cone) | **Done** |
| Boss | Boss | `SLAM` | `TriggerBurst` (knockback, no damage) | **Done** |
| Boss | Boss | `MARK` | `TriggerProjectile` | **Done** |
| Boss | Boss | `PHASE_SKILL` | `TriggerUltimate` (only when charged) | **Done** |

**New** means the game has no such mechanic yet; it is added on the game side, not in firmware.

### Device IDs

| Prop | deviceId | `role` field | Firmware |
| --- | --- | --- | --- |
| Arc Bow | `archer-bow-01` | `ARCHER` | `firmware/arc-bow` |
| Impact armour | `impact-armour-01` | `ARMOUR` | `firmware/impact-armour` |
| Aegis Shield | `guardian-shield-01` | `GUARDIAN` | `firmware/guardian-shield` |
| Twin daggers | `assassin-daggers-01` | `ASSASSIN` | not written yet |
| Lumen Staff | `mage-staff-01` | `MAGE` | not written yet |
| Boss greatsword | `boss-greatsword-01` | `BOSS` | not written yet |

The Unity bridge refuses any line whose `role` differs from the one its deviceId is mapped to (`role_mismatch`), before that device can take a seat. A refused ability (cooldown, windup, not charged, engagement not started) is reported as `ability_not_ready`; an action outside the role's set as `unknown_action`.

Ownership: daggers and staff cover every ability their seat's AI uses, so they take the seat's ability timing (AI keeps moving and aiming). The Boss seat has no scripted AI, so the greatsword only adds ability triggers; Boss movement stays with its current controller (keyboard). How the Boss moves when its player is holding the physical greatsword is an open design decision.

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

- `AtlasPropCombatBridge`: maps `archer-bow-01` to the Archer seat (game Hero2; the old Gunner) and `impact-armour-01` to the Boss, confirms one hit per matching `FIRE` + `SHOT_SEEN` inside 1.5 s, and applies damage through `CombatActor.ApplyDamage`. A `SHOT_SEEN` that arrives before its `FIRE` (two separate links) is held for the same window. Unmatched `FIRE` expires as `expired_no_hit`; a report after that is `late`. The bow takes only the seat's **firing**; its scripted AI keeps moving and aiming. `DeviceDisconnected` hands firing back to the AI and drops that device's in-flight shots.
- `AtlasPropSerialTransport`: one background reader per COM port; a lost port reports `DeviceDisconnected` for the last device seen on it. Needs Api Compatibility Level **.NET Framework** (set for Standalone) because of `System.IO.Ports`. Close the browser bench page first; a COM port opens in one program at a time.
- `AtlasPropSimulatedDevice` + `AtlasPropSimulatedTransport`: hardware-free bow, armour and Guardian shield that print contract-exact lines into the same bridge (keys 1–9: hit, miss, duplicate, out of order, late, reboot, silent reboot, unplug bow, unplug armour; hold G = block, H = taunt, J = unplug shield; Assassin U/I/O, Mage K/L/M, Boss Z/V/B/N, unplug buttons on the HUD).
- Ability seats (`abilitySeats`: daggers → Assassin, staff → Support/Mage, greatsword → Boss): each action calls the existing `CombatActor` ability; see the role table above.
- Guardian (`guardian-shield-01` → Guardian seat): `BLOCK_START`/`BLOCK_END`/`TAUNT` call `CombatActor.BeginBlock`/`EndBlock`/`TriggerTaunt`; the game rejects a taunt on cooldown (`taunt_cooldown`) or with nobody in range (`taunt_no_target`).
- `AtlasPropBridgeHud`: operator panel showing received lines, accepted intents, confirmed hits, rejections with reason, device status and who owns the Archer's firing; HIT/MISS/LATE float over the Boss.
- `AtlasPropBridgeVerification.CliVerify`: edit-mode check of success, duplicate line, duplicate hit report, stale seq, out-of-order arrival, orphan report, miss expiry, late, reboot with and without banner, disconnect/replug and diagnostic lines, plus the AI-moves/prop-fires seat split.

Keep `unity/Runtime` here as the source and copy it over when it changes.

## Required tests in the Unity repository

1. Valid Guardian v1 event is accepted.
2. Same `deviceId + seq` is accepted only once.
3. Lower sequence is rejected as stale.
4. Unsupported version and `LOCAL_REJECT` are rejected.
5. `BLOCK_START` does not produce damage by itself.
6. Disconnect while blocking causes the session layer to release the block safely.

