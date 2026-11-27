// Teardown contract: every mesh group of every 3D prop twin comes off in exactly one step, every
// step names real catalogue parts with bilingual copy and a price, and the page wires it up.
// Geometry runs through lightweight Three stubs; this is not WebGL visual QA.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const browser = { window: {} };
vm.createContext(browser);
vm.runInContext(read("dist/prop-manifests.js"), browser);
vm.runInContext(read("dist/teardown-data.js"), browser);
const { catalog, props, gates, totals } = browser.window.ATLAS_TEARDOWN;
const manifests = browser.window.ATLAS_PROP_MANIFESTS;

// Build all six procedural props with recording stubs.
const source = read("dist/three-lab.js");
const start = source.indexOf("  function buildGuardian(accent) {");
const end = source.indexOf("  const builders = {", start);
assert.ok(start > 0 && end > start, "builder block not found in three-lab.js");
class Shape { moveTo() {} lineTo() {} bezierCurveTo() {} quadraticCurveTo() {} closePath() {} }
class Geometry { constructor(...args) { this.args = args; } translate() {} computeVertexNormals() {} }
class Vector3 { constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); } }
const THREE = new Proxy({ Group: class { constructor() { this.children = []; this.userData = {}; } }, Shape, Vector3, CatmullRomCurve3: class {} },
  { get: (target, key) => target[key] || Geometry });
const addPart = (group, geometry, color, key, position, rotation, scale, options = {}) => {
  const mesh = { position, userData: { partKey: key, electronic: Boolean(options.electronic), explode: options.explode || [0, 0, 0], td: options.td } };
  group.children.push(mesh); return mesh;
};
const context = vm.createContext({
  THREE, propManifests: manifests, addPart,
  linePart: (group, points, color, key, options = {}) => addPart(group, null, color, key, [0, 0, 0], null, null, options),
  addRivet: (group, position, key = "shell", color, options = {}) => addPart(group, null, color, key, position, null, null, options),
  plateGeometry: (...args) => new Geometry(...args), finishModel: group => group
});
vm.runInContext(`${source.slice(start, end)}\nthis.models = { guardian: buildGuardian(1), warrior: buildSword(1), archer: buildBow(1), assassin: buildDaggers(1), mage: buildStaff(1), boss: buildBoss(1) };`, context);

const id = mesh => mesh.userData.td || mesh.userData.partKey;
const has = (text, label) => assert.ok(typeof text === "string" && text.trim().length > 1, label);
const bilingual = (value, label) => { has(value?.vi, `${label}.vi`); has(value?.en, `${label}.en`); };

// Catalogue
for (const [key, item] of Object.entries(catalog)) {
  bilingual(item.name, `${key}.name`); bilingual(item.role, `${key}.role`); bilingual(item.verify, `${key}.verify`);
  assert.ok(gates[item.gate], `${key}: unknown gate ${item.gate}`);
  const [low, high] = item.priceVnd;
  assert.ok(Number.isInteger(low) && Number.isInteger(high) && low > 0 && low <= high && high < 2_000_000, `${key}: bad price ${item.priceVnd}`);
  assert.match(item.url, /^https:\/\/shopee\.vn\/search\?keyword=[^&\s]+$/, `${key}: shop link`);
}
for (const gate of Object.values(gates)) bilingual(gate, "gate");
const used = new Set();

// Steps against the geometry
assert.equal(Object.keys(props).sort().join(), Object.keys(context.models).sort().join());
for (const [prop, { steps }] of Object.entries(props)) {
  const model = context.models[prop];
  const ids = new Set(model.children.map(id));
  assert.equal(steps[0].id, "overview", `${prop}: step 0 must be the assembled overview`);
  assert.equal(steps[0].detach.length + steps[0].parts.length, 0, `${prop}: overview removes nothing`);
  assert.equal(steps.at(-1).detach.join(), "shell", `${prop}: the bare shell is the last step`);
  const seen = new Map();
  steps.forEach((step, index) => {
    bilingual(step.title, `${prop}/${step.id}.title`); bilingual(step.how, `${prop}/${step.id}.how`);
    if (step.caution) bilingual(step.caution, `${prop}/${step.id}.caution`);
    if (index) { assert.ok(step.detach.length, `${prop}/${step.id}: removes nothing`); assert.ok(step.parts.length, `${prop}/${step.id}: lists no parts`); }
    for (const group of step.detach) {
      assert.ok(ids.has(group), `${prop}/${step.id}: no mesh group "${group}" in the 3D model`);
      assert.ok(!seen.has(group), `${prop}: "${group}" removed twice (${seen.get(group)} and ${step.id})`);
      seen.set(group, step.id);
    }
    for (const [part, qty] of step.parts) {
      assert.ok(catalog[part], `${prop}/${step.id}: unknown part ${part}`);
      assert.ok(Number.isInteger(qty) && qty > 0 && qty <= 6, `${prop}/${step.id}: qty ${qty}`);
      used.add(part);
    }
  });
  for (const group of ids) assert.ok(seen.has(group), `${prop}: mesh group "${group}" is never removed`);
  // Electronics come out before the shell they sit in; a step that opens the core warns about USB.
  const core = steps.find(step => step.detach.includes("core"));
  assert.ok(core?.caution && core.parts.some(([part]) => part === "esp32s3"), `${prop}: core step needs the ESP32 and a caution`);
  const sum = totals(prop);
  assert.ok(sum.low > 0 && sum.low <= sum.high && sum.count > 0, `${prop}: totals`);
}
for (const key of Object.keys(catalog)) assert.ok(used.has(key), `catalogue entry ${key} is never used`);

// Prop-specific facts that the teardown must not lose.
const parts = prop => props[prop].steps.flatMap(step => step.parts.map(([part]) => part));
assert.ok(["tsal6200", "npn", "lensTube", "ky024", "magnet"].every(part => parts("archer").includes(part)), "archer: Gate 01 bow parts");
assert.ok(context.models.archer.children.some(mesh => mesh.userData.td === "emitter" && mesh.userData.electronic), "archer: IR emitter mesh");
assert.ok(!parts("archer").includes("mpu6050"), "archer has no IMU");
const bossReceiver = props.boss.steps.find(step => step.detach.includes("armour-receiver"));
assert.equal(bossReceiver.parts.find(([part]) => part === "tsop")?.[1], 3, "boss armour: three receivers");
assert.equal(props.boss.steps.flatMap(step => step.parts).filter(([part]) => part === "esp32s3").reduce((n, [, qty]) => n + qty, 0), 2, "boss: two devices, two ESP32");
assert.ok(props.assassin.steps.find(step => step.detach.includes("passive")).parts.every(([part]) => catalog[part].gate === "shell"), "assassin: passive dagger has no electronics");

// Page wiring
const html = read("dist/index.html");
const order = ["teardown-data.js", "teardown-ui.js", "three-lab.js"].map(name => html.indexOf(`src="${name}"`));
assert.ok(order.every(index => index > 0) && order[0] < order[1] && order[1] < order[2], "scripts must load data → ui → three-lab");
for (const node of ["teardownPanel", "teardownStageBar", "teardownToggle", "teardownPrev", "teardownNext", "teardownSteps", "teardownDetail", "teardownBom", "teardownDownload"]) assert.ok(html.includes(`id="${node}"`), `#${node} missing`);
assert.ok(html.includes('href="teardown.css"'), "teardown.css not linked");
for (const hook of ["atlas-teardown-change", "atlas-teardown-pick", "if (!teardown.active) propModel?.rotateY", "if (teardown.active) return;"]) assert.ok(source.includes(hook), `three-lab.js: ${hook}`);

const summary = Object.keys(props).map(prop => `${prop} ${props[prop].steps.length - 1}`).join(", ");
console.log(`Teardown PASS: ${Object.keys(catalog).length} catalogue parts, every 3D mesh group removed exactly once (${summary} steps), bilingual copy, prices and Shopee links, page wiring. No WebGL visual verification.`);
