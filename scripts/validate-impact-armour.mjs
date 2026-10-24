import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../dist/prop-manifests.js", import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);

const armour = context.window.ATLAS_IMPACT_ARMOUR;
if (!armour?.sharedHardware) throw new Error("Shared impact armour contract missing");
if (Object.keys(armour.wearerProfiles || {}).sort().join(",") !== "boss,hero") throw new Error("Hero and Boss profiles are required");
if (armour.zones?.length !== 3) throw new Error("Exactly three MVP hit zones are required");
if (new Set(armour.zones.map(zone => zone.id)).size !== armour.zones.length) throw new Error("Impact zone IDs must be unique");
for (const event of ["SHOT_SEEN", "HIT_CONFIRM", "HIT_REJECT", "ARMOUR_STATUS"]) {
  if (!armour.events?.includes(event)) throw new Error(`Missing impact event: ${event}`);
}
console.log("Impact armour PASS: shared hardware, Hero/Boss profiles, three zones, and confirmation events.");
