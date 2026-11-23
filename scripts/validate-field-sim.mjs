import fs from "node:fs";
import vm from "node:vm";

// Rule checks for dist/field-sim.js against the values documented in docs/unity-bridge.md.
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(read("dist/gameplay-roster.js"), context);
vm.runInContext(read("dist/field-sim.js"), context);
const config = context.window.ATLAS_GAMEPLAY_ROSTER;
const failures = [];
const expect = (name, ok, detail = "") => { if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ""}`); };

function fresh() {
  let roll = 0;
  const sim = context.window.AtlasFieldSim.create(config, { rng: () => [0.1, 0.5, 0.9][roll++ % 3] });
  const send = (key, action, now) => sim.deliver(sim.makeIntent(key, action, now), now);
  return { sim, send };
}

// Contract: every roster action is in docs/event-contract.md and every device ID in docs/unity-bridge.md.
const contract = read("docs/event-contract.md"); const bridge = read("docs/unity-bridge.md");
for (const [key, item] of Object.entries(config.roster)) {
  const row = contract.split("\n").find(line => line.toLowerCase().startsWith(`| ${key === "boss" ? "boss" : key} |`));
  for (const spec of item.actions) for (const event of [spec.event, ...(spec.draw || []), ...(spec.hold ? [spec.hold] : [])]) {
    expect(`${key} ${event} is in the event contract`, row?.includes("`" + event + "`"));
  }
  expect(`${key} deviceId ${item.deviceId} is in the Unity bridge`, bridge.includes("`" + item.deviceId + "`"));
}

{ // Guardian block: hits on a blocking Guardian deal 30 %.
  const { sim, send } = fresh();
  send("guardian", "TAUNT", 0);
  expect("taunt locks Boss focus on Guardian", sim.snapshot(10).boss.focus === "guardian");
  send("guardian", "BLOCK_START", 100);
  const mark = send("boss", "MARK", 200);
  expect("MARK on a blocking Guardian deals 30 %", mark.outcome.heroDamage.guardian === Math.round(18 * 0.3), JSON.stringify(mark.outcome));
  const again = send("guardian", "TAUNT", 3000);
  expect("taunt has an 8 s cooldown", again.status === "refused" && again.why === "cooldown");
  send("guardian", "BLOCK_END", 3100);
  expect("BLOCK_END releases the block", !sim.snapshot(3100).heroes.guardian.blocking);
}

{ // Taunt halves Boss damage to everyone but the Guardian; team shield takes 60 %.
  const { sim, send } = fresh();
  send("guardian", "TAUNT", 0);
  const sweep = send("boss", "SWEEP", 100);
  expect("SWEEP under taunt hits Guardian in full", sweep.outcome.heroDamage.guardian === 22, JSON.stringify(sweep.outcome));
  const neighbours = Object.entries(sweep.outcome.heroDamage).filter(([k]) => k !== "guardian");
  expect("SWEEP under taunt deals 50 % to the Guardian's neighbours", neighbours.length === 2 && neighbours.every(([, v]) => v === 11), JSON.stringify(sweep.outcome));
  send("mage", "TEAM_SHIELD", 200);
  const mark = send("boss", "MARK", 5000);
  expect("team shield expired after 3 s", mark.outcome.heroDamage.guardian === 18, JSON.stringify(mark.outcome));
  const { send: send2 } = fresh();
  send2("archer", "DRAW_START", 0); send2("archer", "DRAW_READY", 1); send2("archer", "FIRE", 2);
  send2("mage", "TEAM_SHIELD", 10);
  const shielded = send2("boss", "MARK", 20);
  expect("team shield: allies take 60 %", shielded.outcome.heroDamage.archer === Math.round(18 * 0.6), JSON.stringify(shielded.outcome));
}

{ // Mage heal: most-wounded ally below 85 %, +10, else ability_not_ready.
  const { sim, send } = fresh();
  const none = send("mage", "CAST_HEAL", 0);
  expect("heal with nobody hurt is refused", none.status === "refused" && none.why === "heal_no_target");
  send("boss", "SWEEP", 100); send("boss", "MARK", 4000);
  const heal = send("mage", "CAST_HEAL", 5000);
  const hurt = sim.snapshot(5000).heroes;
  expect("heal picks the most-wounded ally", heal.outcome?.healed?.target === "archer", JSON.stringify(heal));
  expect("heal restores 10 HP", hurt.archer.hp === 100 - 22 - 18 + 10, JSON.stringify(hurt.archer));
}

{ // Arc Bow: FIRE + SHOT_SEEN inside 1.5 s confirms once; no report expires; early report is held.
  const { sim, send } = fresh();
  send("archer", "DRAW_START", 0); send("archer", "DRAW_READY", 400);
  const fire = send("archer", "FIRE", 500);
  expect("FIRE opens a shot without damage", fire.outcome.shotOpened === 1 && sim.snapshot().boss.hp === 520);
  const seen = sim.makeShotSeen(fire.line.shot, 700, "chest");
  const hit = sim.deliver(seen, 700);
  expect("SHOT_SEEN inside the window confirms the hit", hit.action === "HIT_CONFIRM" && sim.snapshot().boss.hp === 500, JSON.stringify(hit));
  const dup = sim.deliver({ ...sim.makeShotSeen(fire.line.shot, 750, "chest") }, 750);
  expect("a second report of the same shot is ignored", dup.reason === "duplicate_hit" && sim.snapshot().boss.hp === 500);
  const fire2 = send("archer", "FIRE", 2000);
  sim.tick(3600);
  expect("FIRE without a report expires as expired_no_hit", !sim.snapshot().openShots.includes(fire2.line.shot) && sim.snapshot().stats.expired === 1);
  const early = sim.makeShotSeen(3, 4000, "left");
  expect("a report before its FIRE is held", sim.deliver(early, 4000).status === "held");
  send("archer", "FIRE", 4200);
  expect("the held report confirms when FIRE arrives", sim.snapshot().boss.hp === 480 && sim.snapshot().stats.hits === 2);
}

{ // Bridge rules: duplicate, stale, role mismatch, seats.
  const { sim, send } = fresh();
  const line = sim.makeIntent("assassin", "QUICK_STRIKE", 0);
  sim.deliver(line, 0);
  expect("same deviceId + seq is accepted once", sim.deliver(line, 10).reason === "duplicate");
  expect("a lower seq is stale", sim.deliver({ ...line, seq: 0 }, 20).reason === "stale");
  expect("role must match the deviceId", sim.deliver({ ...sim.makeIntent("assassin", "QUICK_STRIKE", 30), role: "MAGE" }, 30).reason === "role_mismatch");
  expect("an action outside the role set is unknown", sim.deliver({ ...sim.makeIntent("mage", "CAST_HEAL", 40), action: "SLAM" }, 40).reason === "unknown_action");
  expect("the reserve Warrior is not seated", send("warrior", "STRIKE", 50).reason === "not_seated");
  expect("Warrior may only take a melee seat", sim.swapReserve("hero2") === false);
  expect("Warrior takes the Guardian seat", sim.swapReserve("hero1") === true && sim.snapshot().lineup.hero1 === "warrior");
  expect("seated Warrior acts", send("warrior", "STRIKE", 60).status === "accepted");
  expect("benched Guardian is refused", send("guardian", "TAUNT", 70).reason === "not_seated");
  expect("PHASE_SKILL needs a full charge", send("boss", "PHASE_SKILL", 80).why === "not_charged");
}

{ // Prop disconnect: block never stays on; AI takes the seat's abilities.
  const { sim, send } = fresh();
  send("guardian", "BLOCK_START", 0);
  let released = false;
  sim.on(event => { if (event.kind === "connection" && event.releasedBlock) released = true; });
  sim.setConnected("guardian", false, 100);
  expect("unplugging a blocking shield releases the block", released && !sim.snapshot().heroes.guardian.blocking);
  sim.setConnected("archer", false, 100);
  let aiFired = false;
  sim.on(event => { if (event.kind === "accepted" && event.source === "ai" && event.key === "archer") aiFired = true; });
  sim.tick(800);
  expect("AI fires for an unplugged bow", aiFired && sim.snapshot().boss.hp === 500);
}

{ // Assassin trap arms, then damages the Boss once.
  const { sim, send } = fresh();
  send("assassin", "PLACE_TRAP", 0);
  sim.tick(1000); expect("trap is not armed before 1.2 s", sim.snapshot().boss.hp === 520);
  sim.tick(1300); expect("armed trap deals 25 once", sim.snapshot().boss.hp === 495 && sim.snapshot().traps.length === 0);
}

const html = read("dist/index.html");
for (const script of ["gameplay-roster.js", "field-sim.js"]) {
  expect(`${script} loads before app.js`, html.indexOf(script) > 0 && html.indexOf(script) < html.indexOf('src="app.js"'));
}

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Field simulator PASS: contract events, block 30 %, taunt 50 %, team shield 60 %, heal +10, Arc Bow confirm window, duplicate/stale/role checks, reserve seat swap, disconnect → AI and traps.");
