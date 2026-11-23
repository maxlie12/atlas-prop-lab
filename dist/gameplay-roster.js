// Gameplay roster v2 — the single source for every character in the browser field simulator.
// It mirrors docs/unity-bridge.md (role action map, device IDs, game commands) and
// docs/event-kit-v1.md (four active Hero seats + one reserve kit + the Dark Knight Boss).
// Numbers marked `game` come from the Unity bridge notes; every other number is a browser
// placeholder for the replay only. Unity stays authoritative for damage, health and cooldowns.
(function () {
  const action = (event, spec) => ({ event, ...spec });
  const roster = {
    guardian: {
      team: "hero", seat: "hero1", contractRole: "GUARDIAN", deviceId: "guardian-shield-01", prop: "guardian", firmware: "firmware/guardian-shield",
      color: "#f0b44d", glyph: "G", name: ["Guardian", "Hộ vệ"], propName: ["Aegis Shield", "Khiên Aegis"],
      actions: [
        action("BLOCK_START", { hold: "BLOCK_END", label: ["Block (hold)", "Đỡ đòn (giữ)"], command: "BeginBlock / EndBlock", unity: "done", effect: { block: { damageTaken: 0.3, arcDeg: 75, source: "game" } }, cooldownMs: 0, fx: "block" }),
        action("TAUNT", { label: ["Taunt", "Khiêu khích"], command: "TriggerTaunt", unity: "done", effect: { taunt: { ms: 4000, rangeM: 6, othersDamageTaken: 0.5, source: "game" } }, cooldownMs: 8000, cooldownSource: "game", fx: "taunt" })
      ]
    },
    archer: {
      team: "hero", seat: "hero2", contractRole: "ARCHER", deviceId: "archer-bow-01", prop: "archer", firmware: "firmware/arc-bow",
      color: "#16a6c9", glyph: "A", name: ["Archer", "Cung thủ"], propName: ["Arc Bow", "Cung Arc"],
      // The bow is a hold: DRAW_START on draw, DRAW_READY when armed, FIRE on release (firmware/arc-bow).
      actions: [
        action("FIRE", { draw: ["DRAW_START", "DRAW_READY"], drawReadyMs: 450, label: ["Draw & release (hold)", "Kéo & nhả (giữ)"], command: "Open shot → SHOT_SEEN → ApplyDamage", unity: "done", effect: { damage: 20, confirm: "ir" }, cooldownMs: 250, fx: "arrow" })
      ]
    },
    assassin: {
      team: "hero", seat: "hero3", contractRole: "ASSASSIN", deviceId: "assassin-daggers-01", prop: "assassin", firmware: "firmware/assassin-daggers",
      color: "#7057d9", glyph: "X", name: ["Assassin", "Sát thủ"], propName: ["Shade Daggers", "Dao găm Shade"],
      actions: [
        action("QUICK_STRIKE", { label: ["Quick strike", "Đâm nhanh"], command: "TriggerAttack", unity: "done", effect: { damage: 12 }, cooldownMs: 600, fx: "melee" }),
        action("HEAVY_STRIKE", { label: ["Dash strike", "Lướt + đâm"], command: "TriggerDash → TriggerAttack", unity: "done", effect: { damage: 30 }, cooldownMs: 4000, fx: "dash" }),
        action("PLACE_TRAP", { label: ["Place trap", "Đặt bẫy"], command: "TriggerTrap", unity: "done", effect: { trap: { damage: 25, armMs: 1200 } }, cooldownMs: 8000, fx: "trap" })
      ]
    },
    mage: {
      team: "hero", seat: "hero4", contractRole: "MAGE", deviceId: "mage-staff-01", prop: "mage", firmware: "firmware/mage-staff",
      color: "#39cc93", glyph: "M", name: ["Mage", "Pháp sư"], propName: ["Lumen Staff", "Gậy Lumen"],
      actions: [
        action("CAST_HEAL", { label: ["Heal ally", "Hồi máu"], command: "TryHealAlly", unity: "done", effect: { heal: { amount: 10, belowRatio: 0.85, rangeM: 5, source: "game" } }, cooldownMs: 4000, cooldownSource: "game", fx: "heal" }),
        action("CHANNEL", { label: ["Staff bolt", "Tia gậy"], command: "TriggerProjectile", unity: "done", effect: { damage: 14 }, cooldownMs: 1200, fx: "bolt" }),
        action("TEAM_SHIELD", { label: ["Team shield", "Khiên đồng đội"], command: "TriggerTeamShield", unity: "done", effect: { teamShield: { damageTaken: 0.6, ms: 3000, rangeM: 5, source: "game" } }, cooldownMs: 14000, cooldownSource: "game", fx: "team-shield" })
      ]
    },
    warrior: {
      team: "hero", seat: "reserve", contractRole: "WARRIOR", deviceId: "warrior-sword-01", prop: "warrior", firmware: "firmware/warrior-sword",
      color: "#5b8cff", glyph: "W", name: ["Warrior", "Chiến binh"], propName: ["Pulse Sword", "Kiếm Pulse"],
      // Reserve kit: may take any melee seat (docs/unity-bridge.md); its game commands are planned.
      meleeSeats: ["hero1", "hero3"],
      actions: [
        action("STRIKE", { label: ["Strike", "Chém"], command: "TriggerAttack", unity: "planned", effect: { damage: 14 }, cooldownMs: 700, fx: "melee" }),
        action("HEAVY_STRIKE", { label: ["Heavy strike", "Chém mạnh"], command: "TriggerHeavyBlast", unity: "planned", effect: { damage: 32 }, cooldownMs: 4000, fx: "heavy" }),
        action("PARRY", { label: ["Parry", "Đỡ kiếm"], command: "Short block window (new)", unity: "planned", effect: { parry: { damageTaken: 0.3, ms: 600 } }, cooldownMs: 2000, fx: "block" })
      ]
    },
    boss: {
      team: "boss", seat: "boss", contractRole: "BOSS", deviceId: "boss-greatsword-01", prop: "boss", firmware: "firmware/boss-greatsword",
      color: "#ef6b68", glyph: "B", name: ["Dark Knight", "Hiệp sĩ Hắc giáp"], propName: ["Greatsword + 3-zone armour", "Đại kiếm + giáp 3 vùng"],
      actions: [
        action("SWEEP", { label: ["Sweep", "Chém quét"], command: "TriggerHeavyBlast (cone)", unity: "done", effect: { cone: { damage: 22, halfAngleDeg: 75 } }, cooldownMs: 3000, fx: "sweep" }),
        action("SLAM", { label: ["Slam", "Đập đất"], command: "TriggerBurst (knockback, no damage)", unity: "done", effect: { knockback: { rangeM: 5 } }, cooldownMs: 6000, fx: "slam" }),
        action("MARK", { label: ["Mark", "Đánh dấu"], command: "TriggerProjectile", unity: "done", effect: { projectile: { damage: 18 } }, cooldownMs: 2500, fx: "mark" }),
        action("PHASE_SKILL", { label: ["Phase skill", "Tuyệt kỹ"], command: "TriggerUltimate (only when charged)", unity: "done", effect: { ultimate: { damage: 30, needsCharge: 100 } }, cooldownMs: 1000, fx: "phase" })
      ]
    }
  };

  window.ATLAS_GAMEPLAY_ROSTER = Object.freeze({
    roster,
    heroes: ["guardian", "archer", "assassin", "mage", "warrior"],
    // Event Kit v1: four active Hero seats plus the reserve kit; seat angles around the Boss.
    seats: {
      hero1: { angle: 180, label: ["Hero 1", "Hero 1"] },
      hero2: { angle: 108, label: ["Hero 2", "Hero 2"] },
      hero3: { angle: 252, label: ["Hero 3", "Hero 3"] },
      hero4: { angle: 324, label: ["Hero 4", "Hero 4"] },
      reserve: { angle: 36, label: ["Reserve", "Dự bị"], bench: true }
    },
    arenaRadiusM: 4.15,
    limits: { bossHp: 520, heroHp: 100, bossCharge: 100 },
    hitConfirmWindowMs: 1500,
    armourZones: ["left", "chest", "right"],
    aiIntervalMs: 3000
  });
})();
