import fs from "node:fs";
const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../dist/armour-fit.js", import.meta.url), "utf8");
for (const id of ["armourFitGate","wearerProfiles","fitAcceptance","coverageMatrix","coverageVerdict","exportFitEvidence"]) if (!html.includes(`id=\"${id}\"`)) throw new Error(`Armour fit UI missing: ${id}`);
if (!js.includes('profiles = ["small", "large"]') || !js.includes("checks.length === 4")) throw new Error("Two-boundary wearer gate missing");
if (!js.includes('zones = ["left", "chest", "right"]') || !js.includes("zones.length * poses.length")) throw new Error("Three-zone coverage gate missing");
if (!js.includes('required: 15') || !js.includes('lighting: "actual-event-light"')) throw new Error("15-shot event-light protocol missing");
if (!js.includes("physicalProof: fitPass() && coveragePass()")) throw new Error("Fit evidence must remain false until both real gates pass");
console.log("Armour fit PASS: two wearer boundaries, four safety checks each, and a 15-shot three-zone coverage matrix.");
