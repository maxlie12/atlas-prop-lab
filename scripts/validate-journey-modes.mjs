import fs from "node:fs";
import vm from "node:vm";

// The build-route choice (DIY / outsource part / turnkey) must change the journey: every step
// names who does it, routes that hire a maker list what to send, and no two routes are identical.
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const context = { window: {}, document: { querySelector: () => null }, localStorage: { getItem: () => null, setItem() {} }, addEventListener() {} };
context.window.addEventListener = () => {};
vm.createContext(context);
vm.runInContext(read("dist/journey.js"), context);
const { modes, roleCopy, stepCount } = context.window.ATLAS_JOURNEY_MODES;
const failures = [];

for (const id of ["diy", "hybrid", "turnkey"]) {
  const mode = modes[id];
  if (!mode) { failures.push(`missing build route ${id}`); continue; }
  if (mode.roles.length !== stepCount) failures.push(`${id}: ${mode.roles.length} roles for ${stepCount} steps`);
  for (const role of mode.roles) if (!roleCopy.vi[role] || !roleCopy.en[role]) failures.push(`${id}: unknown role ${role}`);
  for (const language of ["vi", "en"]) {
    if (!mode.label[language]?.[0] || !mode.label[language]?.[1]) failures.push(`${id}: missing ${language} label`);
    const notes = Object.keys(mode.notes[language]);
    const other = Object.keys(mode.notes[language === "vi" ? "en" : "vi"]);
    if (notes.join() !== other.join()) failures.push(`${id}: vi/en step notes differ (${notes} vs ${other})`);
    for (const index of notes) if (Number(index) >= stepCount) failures.push(`${id}: note for step ${index} out of range`);
  }
  const hires = mode.roles.some(role => role !== "you");
  if (hires && !mode.handoff.vi.length) failures.push(`${id}: hires a maker but lists nothing to send`);
  if (mode.handoff.vi.length !== mode.handoff.en.length) failures.push(`${id}: vi/en handoff lists differ`);
}
const signatures = Object.values(modes).map(mode => mode.roles.join());
if (new Set(signatures).size !== signatures.length) failures.push("two build routes assign identical roles — the choice would change nothing");

const html = read("dist/index.html");
for (const id of ["journeyBuildMode", "journeyModeSummary", "journeyModeDiy", "journeyModeHybrid", "journeyModeTurnkey"]) if (!html.includes(`id="${id}"`)) failures.push(`journey UI missing #${id}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Journey routes PASS: DIY, outsource-part and turnkey assign distinct owners to all ten steps, with bilingual notes and a maker handoff list.");
