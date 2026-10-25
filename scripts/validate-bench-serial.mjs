import fs from "node:fs";
import vm from "node:vm";

// Replays synthetic bow/armour serial lines through the real bench judge and checks every
// outcome, then checks the firmware emits the event names and fields the judge reads.
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const context = { window: {}, document: { querySelector: () => null }, localStorage: { getItem: () => null } };
vm.createContext(context);
vm.runInContext(read("dist/bench-serial.js"), context);
const { createBenchJudge, HIT_WINDOW_MS } = context.window.ATLAS_BENCH_JUDGE;

const rows = [];
const judge = createBenchJudge((campaign, outcome, latencyMs) => rows.push(`${campaign}:${outcome}:${latencyMs ?? "-"}`));
const bow = (action, shot, at) => judge.onBow({ type: "PLAYER_INTENT", action, shot }, at);
const armour = (type, extra, at) => judge.onArmour({ type, ...extra }, at);

bow("DRAW_READY", 1, 0); bow("FIRE", 1, 500); armour("SHOT_SEEN", { shot: 1, zone: "chest", zones: ["chest"] }, 612);
armour("SHOT_SEEN", { shot: 1, zone: "left", zones: ["left"] }, 700);                          // late repeat
bow("DRAW_READY", 2, 1000); bow("FIRE", 2, 1500); judge.tick(1500 + HIT_WINDOW_MS + 1);          // nothing seen
bow("FIRE", 3, 1600);                                                                             // bounce inside 200 ms
bow("DRAW_READY", 4, 3000); bow("FIRE", 4, 3500); armour("HIT_REJECT", { zone: "right", reason: "INVALID_CODE" }, 3600);
bow("FIRE", 5, 5000);                                                                             // never drawn
armour("SHOT_SEEN", { shot: 99, zone: "chest", zones: ["chest"] }, 5100);                        // unknown shot
judge.tick(10000);

const expected = [
  "bow:pass:-", "hit:pass:112", "hit:duplicate:-",
  "bow:pass:-", "hit:miss:-",
  "bow:duplicate:-",
  "bow:pass:-", "hit:reject:-",
  "bow:reject:-", "hit:reject:-",
  "hit:miss:-", "hit:miss:-"
];
const sorted = list => [...list].sort();
if (JSON.stringify(sorted(rows)) !== JSON.stringify(sorted(expected))) {
  throw new Error(`Bench judge outcomes differ.\nexpected ${JSON.stringify(expected)}\nactual   ${JSON.stringify(rows)}`);
}

const bowFirmware = read("firmware/arc-bow/src/main.cpp");
const armourFirmware = read("firmware/impact-armour/src/main.cpp");
for (const token of ['"DRAW_READY"', '"FIRE"', '\\"shot\\":%u', "\\\"type\\\":\\\"PLAYER_INTENT\\\""]) if (!bowFirmware.includes(token)) throw new Error(`Arc Bow firmware missing ${token}`);
for (const token of ['"SHOT_SEEN"', '"HIT_REJECT"', '"DUPLICATE_IGNORED"', '\\"zones\\":[']) if (!armourFirmware.includes(token)) throw new Error(`Armour firmware missing ${token}`);
for (const id of ["benchSerial", "benchConnectBow", "benchConnectArmour", "benchSerialStatus", "benchSerialLog"]) if (!read("dist/index.html").includes(`id="${id}"`)) throw new Error(`Bench serial UI missing #${id}`);

console.log("Bench serial PASS: judge scores pass/miss/duplicate/reject for both campaigns with host-measured hit latency; firmware events match.");
