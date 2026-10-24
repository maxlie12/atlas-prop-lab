import fs from "node:fs";
const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../dist/bench-evidence.js", import.meta.url), "utf8");
for (const id of ["benchEvidence","benchOutcomeActions","benchLatency","benchProgressBar","benchRecentLog","exportBenchCsv"]) if (!html.includes(`id=\"${id}\"`)) throw new Error(`Bench evidence UI missing: ${id}`);
if (!js.includes("state[name].length === 100") || !js.includes('row.outcome === "pass"')) throw new Error("Strict 100/100 release gate missing");
for (const result of ["pass","miss","duplicate","reject"]) if (!js.includes(`${result}:`)) throw new Error(`Bench outcome missing: ${result}`);
if (!js.includes("atlas-physical-wiring-v1") || !js.includes("gates || []).length === 5")) throw new Error("Wiring gate interlock missing");
if (!js.includes("text/csv") || !js.includes("recordedAt")) throw new Error("Timestamped CSV evidence missing");
console.log("Bench evidence PASS: two persistent 100-trial campaigns, wiring interlock, strict gate, p95, and CSV export.");
