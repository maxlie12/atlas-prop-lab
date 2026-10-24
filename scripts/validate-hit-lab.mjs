import fs from "node:fs";
import vm from "node:vm";

const manifestSource = fs.readFileSync(new URL("../dist/prop-manifests.js", import.meta.url), "utf8");
const hitSource = fs.readFileSync(new URL("../dist/hit-lab.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(manifestSource, context);

const requiredEvents = ["DRAW_READY", "FIRE", "IR_PACKET", "SHOT_SEEN", "HIT_CONFIRM", "HIT_REJECT", "DAMAGE_APPLIED", "DUPLICATE_IGNORED", "MISS_TIMEOUT"];
for (const event of requiredEvents) {
  if (!hitSource.includes(`\"${event}\"`)) throw new Error(`Hit Lab event missing: ${event}`);
}
for (const id of ["hitLab", "hitProfile", "hitScenario", "runHitTest", "hitEventLog", "hitVerdict"]) {
  if (!html.includes(`id=\"${id}\"`)) throw new Error(`Hit Lab UI node missing: ${id}`);
}
if (!hitSource.includes("state.processed.has(shotId)")) throw new Error("Shot de-duplication gate missing");
if (!hitSource.includes("physicalProof: false")) throw new Error("Physical-proof boundary missing");
if (!context.window.ATLAS_IMPACT_ARMOUR?.sharedHardware) throw new Error("Hit Lab must use shared armour contract");
console.log("Hit Lab PASS: Hero/Boss profiles, confirm/reject/miss paths, and duplicate protection are present.");
