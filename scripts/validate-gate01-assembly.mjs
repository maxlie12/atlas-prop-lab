import fs from "node:fs";
import vm from "node:vm";

// The Gate 01 assembly guide is a safety document: its order, pins, part values and the
// buttons it names must match the wiring map, the firmware and the bench pages.
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const exists = path => fs.existsSync(new URL(`../${path}`, import.meta.url));
const failures = [];
const context = { window: {}, document: { querySelector: () => null }, localStorage: { getItem: () => null } };
vm.createContext(context);
vm.runInContext(read("dist/gate01-assembly.js"), context);
const { steps, phases } = context.window.ATLAS_GATE01_ASSEMBLY;
const html = read("dist/index.html");
const wiring = read("dist/physical-wiring.js");
const serial = read("dist/bench-serial.js");
const evidence = read("dist/bench-evidence.js");

if (!html.includes('id="gate01Assembly"') || !html.includes('<script src="gate01-assembly.js"></script>')) failures.push("index.html must mount #gate01Assembly and load gate01-assembly.js");
if (JSON.stringify(Object.keys(phases)) !== JSON.stringify(["core", "ir", "wear"])) failures.push("phases must be core → ir → wear (order of arrival)");
if (new Set(steps.map(step => step.id)).size !== steps.length) failures.push("step ids must be unique");
const order = id => steps.findIndex(step => step.id === id);
for (const step of steps) {
  if (!phases[step.phase]) failures.push(`${step.id}: unknown phase ${step.phase}`);
  for (const l of ["vi", "en"]) if (!Array.isArray(step[l]) || step[l].length !== 2 || !step[l][0] || !step[l][1]) failures.push(`${step.id}: needs a ${l} title and body`);
  for (const match of JSON.stringify([step.vi, step.en]).matchAll(/\{(\w+)\}/g)) if (!["hall", "irTx", "left", "chest", "right"].includes(match[1])) failures.push(`${step.id}: unknown pin placeholder {${match[1]}}`);
  if (step.link && !html.includes(`id="${step.link.slice(1)}"`)) failures.push(`${step.id}: link ${step.link} has no target`);
  if (step.gate != null && !(step.gate >= 0 && step.gate <= 4)) failures.push(`${step.id}: gate index out of range`);
}
const phaseOrder = steps.map(step => Object.keys(phases).indexOf(step.phase));
if (phaseOrder.some((value, index) => index && value < phaseOrder[index - 1])) failures.push("steps must stay grouped in phase order");
for (const pin of ["hall", "irTx", "left", "chest", "right"]) if (!JSON.stringify(steps).includes(`{${pin}}`)) failures.push(`guide never names GPIO {${pin}}`);

// Safety order: flash bare boards, check shorts and measure AO before AO reaches a GPIO,
// identify parts before wiring them, and re-check shorts before connecting both boards.
const before = (a, b, why) => { if (!(order(a) >= 0 && order(b) >= 0 && order(a) < order(b))) failures.push(`${a} must come before ${b}: ${why}`); };
before("flash", "seat", "firmware goes on while the board is bare");
before("hall-power", "continuity", "the short check covers the sensor wiring");
before("continuity", "measure-ao", "no power before the short check");
before("measure-ao", "connect-ao", "AO is metered ≤ 3.3 V before it reaches a GPIO");
before("stage-1", "campaign-1", "campaign 01 is unlocked by the stage-1 checks");
before("unplug", "driver", "wiring changes happen unpowered");
before("transistor", "driver", "E-B-C is identified before the driver is built");
before("polarity", "driver", "LED polarity is identified before the driver is built");
before("polarity", "receivers", "receiver pinout is identified before wiring");
before("continuity-2", "connect-both", "short check before powering the IR circuits");
before("first-shot", "campaign-2", "one shot works before 100");
const text = id => JSON.stringify(steps[order(id)] || {});
if (!/3V3/.test(text("hall-power")) || !/không dùng 5V|not 5V/.test(text("hall-power"))) failures.push("KY-024 must be powered from 3V3, explicitly not 5V");
if (!/3,3 V/.test(text("measure-ao")) || !/3\.3 V/.test(text("measure-ao"))) failures.push("AO measurement must state the 3.3 V limit in both languages");

// Part values and wiring must match the wiring map.
for (const value of ["1 kΩ", "100 Ω"]) if (!text("driver").includes(value) || !wiring.includes(value)) failures.push(`driver value ${value} must match the wiring map`);
if (!text("receivers").includes("4,7 µF") || !text("receivers").includes("4.7 µF") || !wiring.includes("4,7 µF")) failures.push("receiver filter must be 100 Ω + 4.7 µF like the wiring map");
if (!/OUT – GND – VS/.test(text("polarity")) || !/OUT\/GND\/VS/.test(wiring)) failures.push("TSOP38238 pin order must read OUT – GND – VS");

// Every button, file and path the guide names must exist.
const vi = steps.map(step => step.vi.join(" ")).join(" "), en = steps.map(step => step.en.join(" ")).join(" ");
for (const label of ["Kết nối cung", "Đo Hall trực tiếp", "Đặt lại mức nghỉ"]) if (!vi.includes(label) || !serial.includes(label)) failures.push(`button "${label}" must exist in bench-serial.js`);
for (const label of ["Connect bow", "Live Hall reading", "Re-measure rest"]) if (!en.includes(label) || !serial.includes(label)) failures.push(`button "${label}" must exist in bench-serial.js`);
if (!vi.includes("Giai đoạn 1 · chỉ lõi cung") || !wiring.includes("Giai đoạn 1 · chỉ lõi cung")) failures.push("stage-1 label must match physical-wiring.js");
if (!en.includes("Stage 1 · bow core only") || !wiring.includes("Stage 1 · bow core only")) failures.push("stage-1 label must match physical-wiring.js (en)");
for (const path of ["firmware/arc-bow/src/main.cpp", "firmware/impact-armour/src/main.cpp", "scripts/check-bench-evidence.mjs"]) if (!exists(path)) failures.push(`guide names missing ${path}`);
if (!vi.includes("atlas-hit-bench-evidence.csv") || !evidence.includes("atlas-${active}-bench-evidence.csv")) failures.push("CSV file name must match the bench evidence export");

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Gate 01 assembly PASS: ${steps.length} bilingual steps in arrival order (${Object.keys(phases).join(" → ")}); safety order, pins, part values and named buttons match the wiring map, firmware and bench pages.`);
