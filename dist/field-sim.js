// Field simulator rules — a pure, DOM-free replay of the Unity bridge contract.
// Device side: makeIntent() builds the exact PLAYER_INTENT / SHOT_SEEN line a prop would print.
// Game side: deliver() applies the documented bridge rules (dedupe, role check, seat ownership,
// ability readiness) and a light rule preview so the browser can show the consequence.
// This is not a second game engine: no movement, pathing or physics; Unity stays authoritative.
(function (root) {
  function createFieldSim(config, options = {}) {
    const { roster, limits, hitConfirmWindowMs, armourZones } = config;
    const rng = options.rng || Math.random;
    const listeners = new Set();
    let s;

    function reset(now = 0) {
      const lineup = { hero1: "guardian", hero2: "archer", hero3: "assassin", hero4: "mage", reserve: "warrior" };
      s = {
        lineup,
        heroes: Object.fromEntries(config.heroes.map(key => [key, { hp: limits.heroHp, connected: true, blocking: false, parryUntil: 0, shieldUntil: 0, draw: "rest", drawAt: 0 }])),
        boss: { hp: limits.bossHp, charge: 0, focus: "archer", tauntUntil: 0 },
        traps: [], openShots: new Map(), heldReports: [], confirmedShots: new Set(),
        deviceSeq: {}, deviceShot: 0, lastSeenSeq: {}, cooldownUntil: {}, aiNextAt: {},
        stats: { intents: 0, accepted: 0, refused: 0, hits: 0, expired: 0 }, now
      };
      emit({ kind: "reset" });
    }

    const emit = event => listeners.forEach(listener => listener(event));
    const character = key => roster[key];
    const actionSpec = (key, event) => character(key)?.actions.find(item => item.event === event || item.draw?.includes(event) || item.hold === event);
    const seatOf = key => Object.entries(s.lineup).find(([, value]) => value === key)?.[0];
    const isActive = key => key === "boss" || (seatOf(key) && seatOf(key) !== "reserve");
    const activeHeroes = () => Object.entries(s.lineup).filter(([seat]) => seat !== "reserve").map(([, key]) => key);
    const alive = key => key === "boss" ? s.boss.hp > 0 : s.heroes[key]?.hp > 0;
    const cdKey = (key, event) => `${key}:${event}`;
    const rule = (key, name) => roster[key].actions.find(item => item.effect[name])?.effect[name];

    // ---- Device side -------------------------------------------------------------------
    function makeIntent(key, event, now) {
      const item = character(key);
      const seq = (s.deviceSeq[item.deviceId] || 0) + 1;
      s.deviceSeq[item.deviceId] = seq;
      const line = { v: 1, deviceId: item.deviceId, role: item.contractRole, seq, type: "PLAYER_INTENT", action: event, atMs: Math.round(now) };
      if (key === "archer") {
        if (event === "FIRE") s.deviceShot = s.deviceShot === 255 ? 1 : s.deviceShot + 1;
        line.shot = s.deviceShot;
      }
      return line;
    }
    function makeShotSeen(shot, now, zone) {
      const id = "impact-armour-01";
      const seq = (s.deviceSeq[id] || 0) + 1; s.deviceSeq[id] = seq;
      const seen = zone || armourZones[Math.floor(rng() * armourZones.length)];
      return { v: 1, deviceId: id, role: "ARMOUR", seq, type: "SHOT_SEEN", atMs: Math.round(now), shot, shooter: 1, zone: seen, zones: [seen] };
    }

    // ---- Game side ---------------------------------------------------------------------
    function refuse(line, reason, detail = {}) {
      s.stats.refused++;
      const result = { status: "refused", reason, line, ...detail };
      emit({ kind: "refused", ...result });
      return result;
    }
    function deliver(line, now) {
      s.now = now;
      if (line.v !== 1) return refuse(line, "unsupported_version");
      const last = s.lastSeenSeq[line.deviceId] || 0;
      if (line.seq === last) return refuse(line, "duplicate");
      if (line.seq < last) return refuse(line, "stale");
      s.lastSeenSeq[line.deviceId] = line.seq;
      if (line.type === "SHOT_SEEN") return shotSeen(line, now);
      const key = Object.keys(roster).find(item => roster[item].deviceId === line.deviceId);
      if (!key || roster[key].contractRole !== line.role) return refuse(line, "role_mismatch");
      const spec = actionSpec(key, line.action);
      if (!spec) return refuse(line, "unknown_action");
      if (!isActive(key)) return refuse(line, "not_seated");
      if (!alive(key)) return refuse(line, "seat_down");
      s.stats.intents++;
      return apply(key, spec, line, now, "prop");
    }

    function ready(key, spec, now) {
      if (now < (s.cooldownUntil[cdKey(key, spec.event)] || 0)) return "cooldown";
      if (spec.effect.ultimate && s.boss.charge < spec.effect.ultimate.needsCharge) return "not_charged";
      if (spec.effect.heal && !healTarget(key, spec)) return "heal_no_target";
      return null;
    }
    function startCooldown(key, spec, now) { if (spec.cooldownMs) s.cooldownUntil[cdKey(key, spec.event)] = now + spec.cooldownMs; }
    function cooldownLeft(key, event, now) { return Math.max(0, (s.cooldownUntil[cdKey(key, event)] || 0) - now); }

    function apply(key, spec, line, now, source) {
      const event = line.action;
      // Presentation-only and hold-release events never touch cooldowns or health.
      if (spec.draw?.includes(event)) { s.heroes.archer.draw = event === "DRAW_READY" ? "ready" : "drawing"; return accept(key, spec, line, source, { presentation: true }); }
      if (event === spec.hold) { s.heroes[key].blocking = false; return accept(key, spec, line, source, { released: true }); }
      const notReady = ready(key, spec, now);
      if (notReady) return refuse(line, "ability_not_ready", { why: notReady, role: key, cooldownMs: cooldownLeft(key, event, now) });
      startCooldown(key, spec, now);
      const fx = spec.effect; const outcome = {};
      if (fx.block) { s.heroes[key].blocking = true; outcome.blocking = true; }
      if (fx.parry) { s.heroes[key].parryUntil = now + fx.parry.ms; outcome.parryMs = fx.parry.ms; }
      if (fx.taunt) { s.boss.tauntUntil = now + fx.taunt.ms; s.boss.focus = key; outcome.tauntMs = fx.taunt.ms; }
      if (fx.damage && !fx.confirm) outcome.bossDamage = damageBoss(key, fx.damage);
      if (fx.confirm === "ir") {
        if (source === "ai") outcome.bossDamage = damageBoss(key, fx.damage);
        else { s.openShots.set(line.shot, { firedAt: now, key }); s.heroes.archer.draw = "rest"; outcome.shotOpened = line.shot; matchHeldReports(now); }
      }
      if (fx.trap) { const trap = { id: `${now}`, armedAt: now + fx.trap.armMs, damage: fx.trap.damage, key }; s.traps.push(trap); outcome.trap = trap; }
      if (fx.heal) { const target = healTarget(key, spec); s.heroes[target].hp = Math.min(limits.heroHp, s.heroes[target].hp + fx.heal.amount); outcome.healed = { target, amount: fx.heal.amount }; }
      if (fx.teamShield) { activeHeroes().filter(alive).forEach(hero => { s.heroes[hero].shieldUntil = now + fx.teamShield.ms; }); outcome.teamShieldMs = fx.teamShield.ms; }
      if (fx.cone) outcome.heroDamage = coneAttack(fx.cone);
      if (fx.projectile) outcome.heroDamage = hitHeroes([bossTarget(now)], fx.projectile.damage, now);
      if (fx.knockback) outcome.knockback = activeHeroes().filter(alive);
      if (fx.ultimate) { s.boss.charge = 0; outcome.heroDamage = hitHeroes(activeHeroes().filter(alive), fx.ultimate.damage, now); }
      return accept(key, spec, line, source, outcome);
    }
    function accept(key, spec, line, source, outcome) {
      s.stats.accepted++;
      const result = { status: "accepted", key, action: line.action, fx: outcome.presentation ? "draw" : spec.fx, source, line, outcome };
      emit({ kind: "accepted", ...result });
      return result;
    }

    function damageBoss(key, amount) {
      if (s.boss.hp <= 0) return 0;
      const dealt = Math.min(s.boss.hp, amount);
      s.boss.hp -= dealt;
      s.boss.charge = Math.min(limits.bossCharge, s.boss.charge + dealt * 0.25);
      if (s.boss.hp <= 0) emit({ kind: "down", key: "boss" });
      if (s.now >= s.boss.tauntUntil) s.boss.focus = key;
      return dealt;
    }
    function bossTarget(now) {
      if (now < s.boss.tauntUntil && alive("guardian") && isActive("guardian")) return "guardian";
      const focus = s.boss.focus;
      if (focus && alive(focus) && isActive(focus) && roster[focus].team === "hero") return focus;
      return activeHeroes().find(alive) || "guardian";
    }
    function damageTakenFactor(hero, now) {
      let factor = 1;
      const h = s.heroes[hero];
      if (now < s.boss.tauntUntil && hero !== "guardian" && isActive("guardian")) factor *= rule("guardian", "taunt").othersDamageTaken;
      if (now < h.shieldUntil) factor *= rule("mage", "teamShield").damageTaken;
      if (h.blocking) factor *= rule("guardian", "block").damageTaken;
      if (now < h.parryUntil) factor *= rule("warrior", "parry").damageTaken;
      return factor;
    }
    function hitHeroes(targets, base, now) {
      const result = {};
      for (const hero of targets) {
        if (!alive(hero)) continue;
        const dealt = Math.min(s.heroes[hero].hp, Math.round(base * damageTakenFactor(hero, now)));
        s.heroes[hero].hp -= dealt; result[hero] = dealt;
        s.boss.charge = Math.min(limits.bossCharge, s.boss.charge + dealt * 0.6);
        if (s.heroes[hero].hp <= 0) { s.heroes[hero].blocking = false; emit({ kind: "down", key: hero }); }
      }
      return result;
    }
    function coneAttack(cone) {
      const target = bossTarget(s.now);
      const angleOf = key => config.seats[seatOf(key)].angle;
      const targets = activeHeroes().filter(hero => alive(hero) && Math.abs(((angleOf(hero) - angleOf(target) + 540) % 360) - 180) <= cone.halfAngleDeg);
      return hitHeroes(targets, cone.damage, s.now);
    }
    function healTarget(key, spec) {
      const below = spec.effect.heal.belowRatio * limits.heroHp;
      return activeHeroes().filter(hero => hero !== key && alive(hero) && s.heroes[hero].hp < below)
        .sort((a, b) => s.heroes[a].hp - s.heroes[b].hp)[0] || null;
    }

    // ---- Arc Bow → impact armour confirmation --------------------------------------------
    function shotSeen(line, now) {
      s.stats.intents++;
      if (s.confirmedShots.has(line.shot)) return refuse(line, "duplicate_hit");
      const open = s.openShots.get(line.shot);
      if (!open) {
        s.heldReports.push({ line, at: now });
        emit({ kind: "held", line });
        return { status: "held", line };
      }
      return confirm(line, open, now);
    }
    function confirm(line, open, now) {
      s.openShots.delete(line.shot); s.confirmedShots.add(line.shot); s.stats.hits++;
      const dealt = damageBoss(open.key, roster.archer.actions.find(item => item.event === "FIRE").effect.damage);
      const result = { status: "accepted", key: "archer", action: "HIT_CONFIRM", fx: "hit", source: "armour", line, outcome: { bossDamage: dealt, zone: line.zone, shot: line.shot, latencyMs: Math.round(now - open.firedAt) } };
      s.stats.accepted++; emit({ kind: "accepted", ...result });
      return result;
    }
    function matchHeldReports(now) {
      s.heldReports = s.heldReports.filter(report => {
        const open = s.openShots.get(report.line.shot);
        if (!open) return true;
        confirm(report.line, open, now); return false;
      });
    }

    // ---- Time ----------------------------------------------------------------------------
    function tick(now) {
      s.now = now;
      for (const [shot, open] of s.openShots) if (now - open.firedAt > hitConfirmWindowMs) {
        s.openShots.delete(shot); s.stats.expired++;
        emit({ kind: "expired", key: open.key, shot, reason: "expired_no_hit" });
      }
      s.heldReports = s.heldReports.filter(report => {
        if (now - report.at <= hitConfirmWindowMs) return true;
        emit({ kind: "expired", key: "archer", shot: report.line.shot, reason: "late" }); return false;
      });
      s.traps = s.traps.filter(trap => {
        if (now < trap.armedAt) return true;
        const dealt = damageBoss(trap.key, trap.damage);
        emit({ kind: "trap", key: trap.key, trap, bossDamage: dealt }); return false;
      });
      for (const hero of activeHeroes()) {
        if (s.heroes[hero].connected || !alive(hero) || hero === "boss") continue;
        if (now < (s.aiNextAt[hero] || 0)) continue;
        s.aiNextAt[hero] = now + config.aiIntervalMs;
        const spec = character(hero).actions.find(item => (item.effect.damage || item.effect.heal) && !ready(hero, item, now));
        if (spec) apply(hero, spec, { action: spec.event, ai: true }, now, "ai");
      }
    }

    // ---- Operator controls ---------------------------------------------------------------
    function setConnected(key, connected, now) {
      const hero = s.heroes[key]; if (!hero || hero.connected === connected) return;
      hero.connected = connected;
      const released = !connected && hero.blocking;
      if (released) hero.blocking = false;
      if (!connected) { hero.draw = "rest"; s.aiNextAt[key] = now + 600; }
      emit({ kind: "connection", key, connected, releasedBlock: released });
    }
    function swapReserve(seat) {
      const reserve = s.lineup.reserve;
      if (!roster[reserve].meleeSeats?.includes(seat) && !roster[s.lineup[seat]].meleeSeats) return false;
      if (seat === "reserve" || !s.lineup[seat]) return false;
      const benched = s.lineup[seat];
      s.lineup[seat] = reserve; s.lineup.reserve = benched;
      s.heroes[benched].blocking = false;
      emit({ kind: "lineup", lineup: { ...s.lineup }, seat, seated: reserve, benched });
      return true;
    }

    function snapshot(now = s.now) {
      return {
        lineup: { ...s.lineup },
        heroes: Object.fromEntries(Object.entries(s.heroes).map(([key, h]) => [key, { ...h, shielded: now < h.shieldUntil, parrying: now < h.parryUntil }])),
        boss: { ...s.boss, focus: bossTarget(now), taunted: now < s.boss.tauntUntil },
        traps: s.traps.map(trap => ({ ...trap })), openShots: [...s.openShots.keys()], stats: { ...s.stats }
      };
    }

    reset(options.now || 0);
    return {
      reset, makeIntent, makeShotSeen, deliver, tick, setConnected, swapReserve, snapshot, cooldownLeft,
      isActive, seatOf, actionSpec,
      on(listener) { listeners.add(listener); return () => listeners.delete(listener); }
    };
  }
  root.AtlasFieldSim = { create: createFieldSim };
})(typeof window !== "undefined" ? window : globalThis);
