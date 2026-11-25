import fs from "node:fs";
import vm from "node:vm";

// Live/Replay: the field simulator must understand real Serial Monitor logs, order two boards
// on one timeline, judge a replay like the bench page without recording evidence, and drive
// the same bridge rules (incl. the reboot rule) that real lines meet in Unity.
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const failures = [];
const expect = (name, ok, detail = "") => { if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ""}`); };
const context = { window: {}, document: { querySelector: () => null }, localStorage: { getItem: () => null } };
vm.createContext(context);
for (const file of ["dist/gameplay-roster.js", "dist/field-sim.js", "dist/bench-serial.js", "dist/field-live.js"]) vm.runInContext(read(file), context);
const { parseLogLine, buildTimeline, rehearse, SAMPLE_LOG } = context.window.ATLAS_FIELD_LIVE;
const { createBenchJudge } = context.window.ATLAS_BENCH_JUDGE;

// ---- Formats ----------------------------------------------------------------------------------
const fire = '{"v":1,"deviceId":"archer-bow-01","role":"ARCHER","seq":7,"type":"PLAYER_INTENT","action":"FIRE","shot":2,"hall":116,"atMs":2254}';
const twin = parseLogLine(`LINE bow 2254030 ${fire}`);
expect("twin LINE format", twin?.device === "bow" && Math.abs(twin.hostMs - 2254.03) < 1e-6 && twin.evt.action === "FIRE");
const pio = parseLogLine(`14:02:02.294 > ${fire}`);
expect("PlatformIO time filter format", pio?.hostMs === ((14 * 60 + 2) * 60 + 2) * 1000 + 294 && pio.device === "bow");
const ide = parseLogLine(`14:02:02.294 -> ${fire}`);
expect("Arduino IDE timestamp format", ide?.hostMs === pio.hostMs && ide.evt.shot === 2);
const bare = parseLogLine(fire);
expect("bare JSON line", bare?.hostMs === null && bare.device === "bow");
expect("banner marks a reboot", parseLogLine("ATLAS_PROP_READY v1 impact-armour-01 zones=left:6,chest:7,right:8")?.banner === true);
expect("INFO is not a reboot", parseLogLine("ATLAS_PROP_INFO v1 archer-bow-01 hall=4 ir=5")?.banner === false);
expect("noise lines are skipped", parseLogLine("ets Jun  8 2016 00:22:57") === null && parseLogLine("{broken json") === null);

// ---- Timeline --------------------------------------------------------------------------------
const sample = buildTimeline(SAMPLE_LOG);
expect("sample timeline is monotonic", sample.every((item, index) => !index || item.t >= sample[index - 1].t));
expect("sample keeps every line", sample.length === SAMPLE_LOG.split("\n").length, `${sample.length}`);
const untimed = buildTimeline([fire, '{"v":1,"deviceId":"impact-armour-01","role":"ARMOUR","seq":1,"type":"SHOT_SEEN","atMs":90000,"shot":2,"shooter":1,"zone":"chest","zones":["chest"]}',
  fire.replace('"seq":7', '"seq":9').replace('"atMs":2254', '"atMs":3254').replace('"shot":2', '"shot":3')].join("\n"));
expect("untimed: other board follows by the cross gap", untimed[1].t === 110, `${untimed[1].t}`);
expect("untimed: same board uses its own atMs delta", untimed[2].t === 1000, `${untimed[2].t}`);

// ---- Rehearsal judge on the sample (a chest hit, a two-zone hit, a reflection, a TV remote,
// an out-of-range miss and a final hit) ------------------------------------------------------
const result = rehearse(sample, createBenchJudge);
expect("rehearsal bow", result.bow.pass === 5 && result.bow.duplicate === 0 && result.bow.reject === 0, JSON.stringify(result.bow));
expect("rehearsal hits", result.hit.pass === 4 && result.hit.miss === 1 && result.hit.reject === 1 && result.hit.duplicate === 0, JSON.stringify(result.hit));
expect("rehearsal latency", result.p95 >= 100 && result.p95 <= 120, `${result.p95}`);

// ---- Same lines through the bridge rules ----------------------------------------------------
const config = context.window.ATLAS_GAMEPLAY_ROSTER;
const sim = context.window.AtlasFieldSim.create(config, { rng: () => 0.5, now: 0 });
const damage = config.roster.archer.actions.find(item => item.event === "FIRE").effect.damage;
for (const item of sample) {
  sim.tick(item.t);
  if (item.banner) sim.resetDevice(item.device === "bow" ? "archer-bow-01" : "impact-armour-01");
  if (!item.evt || (item.device === "armour" && item.evt.type !== "SHOT_SEEN")) continue;   // field-ui notes armour rejects
  sim.deliver(item.evt, item.t);
}
sim.tick(sample[sample.length - 1].t + 2000);
const snap = sim.snapshot();
expect("replayed hits reach the bridge", snap.stats.hits === 4, `${snap.stats.hits}`);
expect("boss takes the confirmed damage only", snap.boss.hp === config.limits.bossHp - 4 * damage, `${snap.boss.hp}`);
expect("the out-of-range shot expires", snap.stats.expired === 1, `${snap.stats.expired}`);

// Shot ids are 1–255 and restart on a bow reboot: the same id later is a new shot.
{
  const again = context.window.AtlasFieldSim.create(config, { rng: () => 0.5, now: 0 });
  const bowLine = (seq, shot, atMs) => ({ v: 1, deviceId: "archer-bow-01", role: "ARCHER", seq, type: "PLAYER_INTENT", action: "FIRE", shot, hall: 700, atMs });
  const seen = (seq, shot, atMs) => ({ v: 1, deviceId: "impact-armour-01", role: "ARMOUR", seq, type: "SHOT_SEEN", atMs, shot, shooter: 1, zone: "chest", zones: ["chest"] });
  again.deliver(bowLine(1, 1, 1000), 0); again.deliver(seen(1, 1, 5000), 110);
  expect("a repeat inside the window is a duplicate", again.deliver(seen(2, 1, 5100), 300).reason === "duplicate_hit");
  again.resetDevice("archer-bow-01");
  again.deliver(bowLine(1, 1, 200), 5000);
  expect("after a bow reboot shot #1 is a new hit", again.deliver(seen(3, 1, 9000), 5110).action === "HIT_CONFIRM" && again.snapshot().stats.hits === 2);
  again.deliver(bowLine(2, 1, 9000), 9000);
  expect("the same id after the window is a new hit", again.deliver(seen(4, 1, 13000), 9100).action === "HIT_CONFIRM");
}

// Reboot rule (docs/event-contract.md): lower seq + lower atMs is a reboot, not stale.
const fresh = context.window.AtlasFieldSim.create(config, { now: 0 });
const intent = (seq, atMs) => ({ v: 1, deviceId: "archer-bow-01", role: "ARCHER", seq, type: "PLAYER_INTENT", action: "DRAW_START", shot: 0, atMs });
expect("first line accepted", fresh.deliver(intent(9, 90000), 0).status === "accepted");
expect("lower seq, higher uptime is stale", fresh.deliver(intent(8, 95000), 10).reason === "stale");
expect("lower seq, lower uptime is a reboot", fresh.deliver(intent(1, 400), 20).status === "accepted");
expect("after a reboot the counter restarts", fresh.deliver(intent(1, 400), 30).reason === "duplicate");
fresh.resetDevice("archer-bow-01");
expect("resetDevice forgets the counter", fresh.deliver(intent(1, 99999), 40).status === "accepted");

// ---- Page wiring and the evidence boundary --------------------------------------------------
const html = read("dist/index.html"); const live = read("dist/field-live.js"); const ui = read("dist/field-ui.js"); const serial = read("dist/bench-serial.js");
for (const id of ["signalSource", "signalLive", "signalReplay", "replayInput", "replayRun", "replaySample", "signalDownload"]) expect(`#${id} in index.html`, html.includes(`id="${id}"`));
expect("field-live loads after bench-serial", html.indexOf('src="field-live.js"') > html.indexOf('src="bench-serial.js"'));
expect("replay never writes hardware evidence", !/recordTrial|ATLAS_BENCH_EVIDENCE|atlas-bench-evidence/.test(live));
expect("field UI exposes device injection", /injectDeviceLine/.test(ui) && /setLiveDevice/.test(ui));
expect("bench serial broadcasts lines and board state", /atlas-device-line/.test(serial) && /atlas-device-text/.test(serial) && /atlas-bench-boards/.test(serial));

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Field Live/Replay PASS: 4 log formats, two-board timeline, rehearsal judge (bow ${result.bow.pass} PASS · ${result.hit.pass} HIT · ${result.hit.miss} MISS · ${result.hit.reject} REJECT, p95 ${result.p95} ms) without touching evidence, bridge damage and the reboot rule.`);
