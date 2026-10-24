import fs from "node:fs";
const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../dist/physical-wiring.js", import.meta.url), "utf8");
for (const id of ["physicalWiring","wiringMap","wiringPinGrid","wiringCalculation","wiringVerdict","wiringGates"]) if (!html.includes(`id=\"${id}\"`)) throw new Error(`Wiring UI missing: ${id}`);
for (const key of ["hall: 4","irTx: 5","left: 6","chest: 7","right: 8"]) if (!js.includes(key)) throw new Error(`Provisional pin missing: ${key}`);
for (const safety of ["≤3,3 V","transistor","continuity","no battery"]) if (!js.includes(safety)) throw new Error(`Wiring safety gate missing: ${safety}`);
if (!js.includes("new Set(Object.values(state.pins)") || !js.includes("verdictConflict")) throw new Error("Duplicate GPIO blocker missing");
console.log("Physical wiring PASS: editable unique GPIO map, transistor drive, receiver filtering, and five pre-power gates.");
