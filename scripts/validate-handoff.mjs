import fs from "node:fs";

const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const script = fs.readFileSync(new URL("../dist/project-handoff.js", import.meta.url), "utf8");
const guide = fs.readFileSync(new URL("../dist/downloads/arc-bow-impact-armour-handoff.md", import.meta.url), "utf8");
for (const id of ["projectHandoff", "projectHandoffStatus", "projectGates", "downloadHandoffJson", "downloadHandoffMd"]) {
  if (!html.includes(`id=\"${id}\"`)) throw new Error(`Handoff node missing: ${id}`);
}
for (const boundary of ["physicalProof: false", "manufacturingReady: false", "digitalGatesPassed: 4", "totalGates: 5"]) {
  if (!script.includes(boundary)) throw new Error(`Handoff evidence boundary missing: ${boundary}`);
}
if (!guide.includes("100 Hall-sensor") || !guide.includes("100 coded hit packets")) throw new Error("Physical test sample gates missing");
console.log("Handoff PASS: four digital gates stay separate from the blocked physical proof gate.");
