# Affordable MVP Feedback Loop

## Decision

Atlas v0.9 does not require a projector, camera tracking, haze, or a visible beam between players.

The first physical proof must validate one synchronized cause-and-effect loop:

1. the Archer draws the low-tension cosmetic string;
2. the Hall sensor changes the bow LEDs from idle to charged;
3. release sends a `FIRE` intent to Unity;
4. Unity checks cooldown, selected target zone, and game state;
5. the spectator screen renders the virtual projectile;
6. Unity emits `HIT_CONFIRMED`;
7. only the confirmed Boss armour zone flashes red-white while local sound completes the impact.

Unity remains authoritative. The bow never decides whether an attack hit.

## MVP hardware boundary

### Build now

- one no-projectile EVA/PVC Arc Bow;
- one linear Hall sensor and draw magnet;
- two short diffused WS2812B limb segments;
- one ESP32 bow core powered over USB for the first proof;
- one Unity display and local speaker;
- one Boss armour receiver with three removable LED zones: left shoulder, chest, and right shoulder.

### Defer

- overhead projector;
- camera or UWB position tracking;
- projection mapping;
- theatrical haze and moving-head lights;
- free-aim world-space hit detection.

## Targeting without a camera

The first match uses discrete zones rather than measured world coordinates. The Archer selects left shoulder, chest, or right shoulder. Unity validates the shot against the current game state and tells the armour which zone to illuminate.

This preserves player choice and Boss dodging while avoiding tracking cost and venue calibration.

## Purchase gate

Do not buy or rent stage projection equipment until a three-person playtest confirms all of the following:

- draw and release are understandable without instruction after one demonstration;
- the full release-to-armour response feels like one event;
- the screen effect and physical flash are easy for spectators to associate;
- false `FIRE` events and duplicated `HIT_CONFIRMED` events are absent;
- the loop remains convincing in normal convention lighting and noise.

Only then test fixed floor zones or a rented overhead projector as an event enhancement.
