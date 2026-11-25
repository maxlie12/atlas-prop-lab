import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { evaluate, parseCsv, selfTest } from "./check-bench-evidence.mjs";

// Gate 01 digital twin, end to end: compiles firmware/test/test_ir_link.cpp (real Arc Bow and
// impact-armour firmware on one µs clock with a TSOP38238 timing model), checks every line
// against the event contract, replays the 100-shot campaign through the web bench judge
// (dist/bench-serial.js) and scores the resulting CSV with scripts/check-bench-evidence.mjs.
// Simulated output is never written to real evidence; it only proves the software chain.
const root = new URL("../", import.meta.url);
const file = relative => decodeURIComponent(new URL(relative, root).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const read = relative => fs.readFileSync(file(relative), "utf8");
const failures = [];

selfTest();

const compiler = ["g++", "clang++"].find(cxx => spawnSync(cxx, ["--version"], { encoding: "utf8" }).status === 0);
if (!compiler) {
  console.log("IR link digital twin SKIPPED: no g++/clang++ on this machine (CI runs it on ubuntu-latest).");
  process.exit(0);
}
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-link-"));
const binary = path.join(outDir, os.platform() === "win32" ? "ir_link.exe" : "ir_link");
const build = spawnSync(compiler, ["-std=c++17", "-O1", "-Wall", "-Wextra", "-Werror", "-Wno-unused-parameter", "-I", file("firmware/test/link"), "-o", binary, file("firmware/test/test_ir_link.cpp")], { encoding: "utf8" });
if (build.status !== 0) { console.error(`test_ir_link.cpp does not compile:\n${build.stderr.trim()}`); process.exit(1); }
const run = spawnSync(binary, [], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
fs.rmSync(outDir, { recursive: true, force: true });
const stdout = run.stdout || "";
for (const line of stdout.split("\n")) if (line.startsWith("FAIL")) failures.push(line);
if (!stdout.includes("RESULT PASS")) failures.push("test_ir_link did not pass");

// ---- Contract check on every printed line ---------------------------------------------------
const contract = read("docs/event-contract.md");
const archerRow = contract.split("\n").find(line => line.toLowerCase().startsWith("| archer |")) || "";
const archerActions = new Set([...archerRow.matchAll(/`([A-Z_]+)`/g)].map(match => match[1]));
const records = stdout.split("\n").filter(line => line.startsWith("LINE ")).map(line => {
  const [, device, us, ...rest] = line.split(" ");
  return { device, ms: Number(us) / 1000, text: rest.join(" ") };
});
const lastSeq = { bow: 0, armour: 0 };
for (const { device, text } of records) {
  if (!text.startsWith("{")) {
    if (!text.startsWith("ATLAS_")) failures.push(`${device}: text line must start with ATLAS_: ${text}`);
    if (text.startsWith("ATLAS_PROP_INFO") && !/^ATLAS_PROP_INFO v1 (archer-bow-01|impact-armour-01) /.test(text)) failures.push(`bad INFO line: ${text}`);
    continue;
  }
  const json = JSON.parse(text);
  if (json.v !== 1) failures.push(`${device}: v must be 1 in ${text}`);
  if (!Number.isInteger(json.atMs)) failures.push(`${device}: atMs missing in ${text}`);
  if (json.seq !== lastSeq[device] + 1) failures.push(`${device}: seq ${json.seq} after ${lastSeq[device]} is not monotonic +1`);
  lastSeq[device] = json.seq;
  if (device === "bow") {
    if (json.deviceId !== "archer-bow-01" || json.role !== "ARCHER" || json.type !== "PLAYER_INTENT") failures.push(`bow identity wrong: ${text}`);
    if (!archerActions.has(json.action)) failures.push(`bow action ${json.action} is not in the archer contract row`);
    if (!Number.isInteger(json.shot) || !Number.isInteger(json.hall)) failures.push(`bow line lacks shot/hall: ${text}`);
  } else {
    if (json.deviceId !== "impact-armour-01" || json.role !== "ARMOUR") failures.push(`armour identity wrong: ${text}`);
    if (!["SHOT_SEEN", "HIT_REJECT", "DUPLICATE_IGNORED"].includes(json.type)) failures.push(`armour type ${json.type} unexpected`);
    if (json.type === "SHOT_SEEN" && (!Number.isInteger(json.shot) || json.shooter !== 1 || !Array.isArray(json.zones) || !json.zones.includes(json.zone))) failures.push(`malformed SHOT_SEEN: ${text}`);
  }
}

// ---- Replay the campaign through the real web bench judge ---------------------------------
const context = { window: {}, document: { querySelector: () => null }, localStorage: { getItem: () => null } };
vm.createContext(context);
vm.runInContext(read("dist/bench-serial.js"), context);
const { createBenchJudge, HIT_WINDOW_MS } = context.window.ATLAS_BENCH_JUDGE;
// ---- The web board check must understand what the real firmware prints -----------------
const { parseBenchText, pinMismatches } = context.window.ATLAS_BENCH_JUDGE;
const expectedPins = { bow: { hall: 4, irTx: 5 }, armour: { left: 6, chest: 7, right: 8 } };
let identities = 0, hallLines = 0;
for (const { device, text } of records) {
  if (!text.startsWith("ATLAS_")) continue;
  const parsed = parseBenchText(text);
  if (text.startsWith("ATLAS_PROP_")) {
    identities++;
    if (!parsed || parsed.kind !== device) { failures.push(`web parser misreads identity: ${text}`); continue; }
    if (JSON.stringify(parsed.pins) !== JSON.stringify(expectedPins[device])) failures.push(`web parser pins ${JSON.stringify(parsed.pins)} for ${text}`);
    if (pinMismatches(parsed.pins, { hall: 4, irTx: 5, left: 6, chest: 7, right: 8 }).length) failures.push(`default wiring map disagrees with firmware: ${text}`);
    if (!pinMismatches(parsed.pins, { hall: 9, irTx: 5, left: 6, chest: 7, right: 8 }).length && device === "bow") failures.push("pin mismatch not detected");
    if (device === "bow" && !(parsed.hallRest > 0 && parsed.start === 150 && parsed.ready === 600)) failures.push(`bow identity lacks thresholds: ${text}`);
  } else if (text.startsWith("ATLAS_HALL ")) {
    hallLines++;
    if (!parsed || parsed.type !== "hall" || !["rest", "drawing", "ready"].includes(parsed.state)) failures.push(`web parser misreads Hall line: ${text}`);
  }
}
if (identities < 4 || hallLines < 3) failures.push(`twin printed too few identity (${identities}) or Hall (${hallLines}) lines`);

const start = stdout.indexOf("CAMPAIGN START"), end = stdout.indexOf("CAMPAIGN END");
const campaignLines = new Set(stdout.slice(start, end).split("\n").filter(line => line.startsWith("LINE ")));
const trials = { bow: [], hit: [] };
const judge = createBenchJudge((campaign, outcome, latencyMs, note) => trials[campaign].push({ outcome, latencyMs, note }));
const usbLatencyMs = 2;  // USB CDC / UART bridge delivery, added to both devices alike
for (const raw of stdout.split("\n")) {
  if (!campaignLines.has(raw)) continue;
  const [, device, us, ...rest] = raw.split(" ");
  const text = rest.join(" ");
  if (!text.startsWith("{")) continue;
  const now = Number(us) / 1000 + usbLatencyMs;
  judge.tick(now);
  if (device === "bow") judge.onBow(JSON.parse(text), now); else judge.onArmour(JSON.parse(text), now);
}
judge.tick(Infinity);
const tally = list => list.reduce((acc, row) => ({ ...acc, [row.outcome]: (acc[row.outcome] || 0) + 1 }), {});
if (trials.bow.length !== 100 || tally(trials.bow).pass !== 100) failures.push(`bow campaign: ${JSON.stringify(tally(trials.bow))}, expected 100 pass`);
if (trials.hit.length !== 100 || tally(trials.hit).pass !== 100) failures.push(`hit campaign: ${JSON.stringify(tally(trials.hit))}, expected 100 pass`);
const latencies = trials.hit.map(row => row.latencyMs).filter(Number.isFinite).sort((a, b) => a - b);
const p95 = latencies[Math.ceil(latencies.length * 0.95) - 1];
if (!(latencies[latencies.length - 1] < HIT_WINDOW_MS)) failures.push(`twin hit latency ${latencies[latencies.length - 1]} ms exceeds the ${HIT_WINDOW_MS} ms bench window`);

// ---- Score the same trials the way a real exported CSV is scored --------------------------
const toCsv = (campaign, list) => ["campaign,trial,outcome,latency_ms,source,note,recorded_at",
  ...list.map((row, index) => [campaign, index + 1, row.outcome, row.latencyMs == null ? "" : Math.round(row.latencyMs), "twin", `"${row.note.replaceAll('"', '""')}"`, "2026-11-25T00:00:00.000Z"].join(","))].join("\n");
const hitReport = evaluate(parseCsv(toCsv("hit", trials.hit)));
const bowReport = evaluate(parseCsv(toCsv("bow", trials.bow)));
if (!hitReport.readyForReview) failures.push(`CSV checker rejects the twin hit campaign: ${JSON.stringify(hitReport.checks)}`);
if (!bowReport.readyForReview) failures.push(`CSV checker rejects the twin bow campaign: ${JSON.stringify(bowReport.checks)}`);

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
const checks = stdout.split("\n").filter(line => line.startsWith("PASS ")).length;
console.log(`IR link digital twin PASS (${compiler}): ${checks} firmware checks; ${records.length} lines match the contract; campaign 100/100 bow + 100/100 hit through the web judge, hit latency p95 ${Math.round(p95)} ms (max ${Math.round(latencies[latencies.length - 1])} ms, window ${HIT_WINDOW_MS} ms); CSV checker ready.`);
