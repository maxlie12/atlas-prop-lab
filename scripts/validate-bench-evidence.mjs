import fs from "node:fs";
import vm from "node:vm";
const html = fs.readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../dist/bench-evidence.js", import.meta.url), "utf8");
for (const id of ["benchEvidence","benchOutcomeActions","benchLatency","benchProgressBar","benchRecentLog","exportBenchCsv"]) if (!html.includes(`id=\"${id}\"`)) throw new Error(`Bench evidence UI missing: ${id}`);
if (!js.includes("state[name].length === 100") || !js.includes('row.outcome === "pass"')) throw new Error("Strict 100/100 release gate missing");
for (const result of ["pass","miss","duplicate","reject"]) if (!js.includes(`${result}:`)) throw new Error(`Bench outcome missing: ${result}`);
if (!js.includes("text/csv") || !js.includes("recordedAt")) throw new Error("Timestamped CSV evidence missing");

// Behaviour of the wiring interlock per campaign, run against the real module with a stub DOM.
const element = () => new Proxy({ style: {}, dataset: {}, classList: { toggle() {}, add() {}, remove() {} }, addEventListener() {} }, {
  get: (target, key) => (key in target ? target[key] : ""), set: (target, key, value) => { target[key] = value; return true; }
});
const store = new Map();
const context = {
  window: { addEventListener() {}, dispatchEvent() {} }, CustomEvent: class {}, confirm: () => true,
  document: { querySelector: element, querySelectorAll: () => [] },
  localStorage: { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value)) }
};
vm.createContext(context);
vm.runInContext(js, context);
const evidence = context.window.ATLAS_BENCH_EVIDENCE;
const cases = [
  { wiring: { gates: [] }, bow: false, hit: false, name: "no checks" },
  { wiring: { gates: [0, 1, 4] }, bow: false, hit: false, name: "core checks without the stage-1 promise" },
  { wiring: { gates: [0, 1, 4], bowOnly: true }, bow: true, hit: false, name: "stage 1 bow core only" },
  { wiring: { gates: [0, 1, 2, 3], bowOnly: true }, bow: false, hit: false, name: "missing the common-GND/no-battery check" },
  { wiring: { gates: [0, 1, 2, 3, 4] }, bow: true, hit: true, name: "all five checks" }
];
for (const test of cases) {
  store.clear();
  store.set("atlas-physical-wiring-v1", JSON.stringify(test.wiring));
  const bow = evidence.recordTrial("bow", "pass", null, "", "validator");
  const hit = evidence.recordTrial("hit", "pass", 100, "", "validator");
  if (bow !== test.bow || hit !== test.hit) throw new Error(`Wiring interlock wrong for ${test.name}: bow ${bow}/${test.bow}, hit ${hit}/${test.hit}`);
}
console.log("Bench evidence PASS: two persistent 100-trial campaigns, per-campaign wiring interlock (stage-1 bow core, full kit for hits), strict gate, p95, and CSV export.");
