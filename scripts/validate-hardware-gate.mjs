import fs from "node:fs";
const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const journey = fs.readFileSync(new URL("../dist/journey.js", import.meta.url), "utf8");
for (const id of ["physicalGate","physicalWiring","benchEvidence","armourFitGate"]) if (!html.includes(`id=\"${id}\"`)) throw new Error(`Hardware Gate stage missing: ${id}`);
for (const step of ['id: "buy"','id: "wire"','id: "bench"','id: "fit"']) if (!journey.includes(step)) throw new Error(`Journey link missing: ${step}`);
if (!html.includes("V0.12 HARDWARE GATE") || !html.includes("revision 0.12")) throw new Error("Hardware Gate revision labels missing");
if (!html.includes('href="#physicalGate"')) throw new Error("Handoff-to-hardware link missing");
console.log("Hardware Gate PASS: purchase, wiring, 200-trial evidence, fit, and coverage are linked into the product journey.");
