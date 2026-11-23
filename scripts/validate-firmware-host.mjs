import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";

// Compiles each role firmware on the host against firmware/test/host (Arduino stand-ins),
// runs its button/IMU scenarios, and checks every printed line against the event contract.
// The real ESP32-S3 build stays in .github/workflows/firmware.yml (PlatformIO).
const root = new URL("../", import.meta.url);
const file = relative => fileURLToPathCompat(new URL(relative, root));
function fileURLToPathCompat(url) { return decodeURIComponent(url.pathname.replace(/^\/([A-Za-z]:)/, "$1")); }

const compiler = ["g++", "clang++"].find(cxx => spawnSync(cxx, ["--version"], { encoding: "utf8" }).status === 0);
if (!compiler) {
  console.log("Firmware host tests SKIPPED: no g++/clang++ on this machine (CI runs them on ubuntu-latest).");
  process.exit(0);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(file("dist/gameplay-roster.js"), "utf8"), context);
const roster = context.window.ATLAS_GAMEPLAY_ROSTER.roster;
const contract = fs.readFileSync(file("docs/event-contract.md"), "utf8");
const actionsFor = key => {
  const row = contract.split("\n").find(line => line.toLowerCase().startsWith(`| ${key} |`));
  return new Set([...(row || "").matchAll(/`([A-Z_]+)`/g)].map(match => match[1]));
};

const suites = [
  { test: "test_guardian_shield.cpp", key: "guardian" },
  { test: "test_warrior_sword.cpp", key: "warrior" },
  { test: "test_assassin_daggers.cpp", key: "assassin" },
  { test: "test_mage_staff.cpp", key: "mage" },
  { test: "test_boss_greatsword.cpp", key: "boss" }
];
const failures = [];
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-fw-"));
let lineCount = 0;
for (const { test, key } of suites) {
  const character = roster[key];
  const firmwareMain = file(`${character.firmware}/src/main.cpp`);
  if (!fs.existsSync(firmwareMain)) { failures.push(`${key}: ${character.firmware}/src/main.cpp is missing`); continue; }
  const binary = path.join(outDir, test.replace(".cpp", os.platform() === "win32" ? ".exe" : ""));
  const build = spawnSync(compiler, ["-std=c++17", "-Wall", "-Wextra", "-Werror", "-Wno-unused-parameter", "-I", file("firmware/test/host"), "-o", binary, file(`firmware/test/${test}`)], { encoding: "utf8" });
  if (build.status !== 0) { failures.push(`${test} does not compile:\n${build.stderr.trim()}`); continue; }
  const run = spawnSync(binary, [], { encoding: "utf8" });
  for (const line of run.stdout.split("\n")) if (line.startsWith("FAIL")) failures.push(`${key}: ${line}`);
  if (!run.stdout.includes("RESULT PASS")) failures.push(`${test} did not pass`);
  const allowed = actionsFor(key);
  let lastSeq = 0;
  for (const raw of run.stdout.split("\n").filter(line => line.startsWith("LINE {"))) {
    const json = JSON.parse(raw.slice(5)); lineCount++;
    if (json.v !== 1) failures.push(`${key}: v must be 1 in ${raw}`);
    if (json.deviceId !== character.deviceId) failures.push(`${key}: deviceId ${json.deviceId} ≠ roster ${character.deviceId}`);
    if (!allowed.has(json.action)) failures.push(`${key}: ${json.action} is not in the ${key} contract row`);
    if (json.type === "PLAYER_INTENT") {
      if (json.role !== character.contractRole) failures.push(`${key}: role ${json.role} ≠ ${character.contractRole}`);
      if (json.seq !== lastSeq + 1) failures.push(`${key}: seq ${json.seq} after ${lastSeq} is not monotonic +1`);
      if (!Number.isInteger(json.atMs)) failures.push(`${key}: atMs missing`);
      lastSeq = json.seq;
    } else if (json.type === "LOCAL_REJECT") {
      if (json.reason !== "COOLDOWN" || !(json.remainingMs > 0)) failures.push(`${key}: malformed LOCAL_REJECT ${raw}`);
      if ("role" in json || "seq" in json) failures.push(`${key}: LOCAL_REJECT must not look like gameplay (${raw})`);
    } else failures.push(`${key}: unexpected type ${json.type}`);
  }
}
fs.rmSync(outDir, { recursive: true, force: true });

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Firmware host tests PASS (${compiler}): Guardian, Warrior, Assassin, Mage and Dark Knight scenarios; ${lineCount} printed lines match the event contract, device IDs and monotonic seq.`);
