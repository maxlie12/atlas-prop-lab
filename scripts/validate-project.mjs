import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = [
  "dist/index.html", "dist/styles.css", "dist/prop-manifests.js", "dist/app.js", "dist/three-lab.js", "dist/favicon.svg",
  "wokwi/diagram.json", "wokwi/scenarios/cast-and-special.yaml", "wokwi.toml",
  "firmware/spell-orb/platformio.ini", "firmware/spell-orb/src/main.cpp",
  "firmware/guardian-shield/platformio.ini", "firmware/guardian-shield/src/main.cpp",
  "docs/event-contract.md", "docs/bom.md", "docs/assembly-32-steps.md",
  "docs/event-kit-v1.md", "docs/role-build-contract.md", "docs/guardian-production-pack.md", "docs/guardian-purchase-ledger.md",
  "dist/downloads/guardian-template-500mm.svg", "dist/downloads/guardian-rear-layout.svg",
  "docs/arc-bow-production-pack.md", "dist/downloads/arc-bow-template-900mm.svg", "dist/downloads/arc-bow-riser-layout.svg",
  "docs/guardian-electronics.md", "wokwi/guardian-diagram.json", "wokwi/scenarios/guardian-block.yaml", "wokwi-guardian.toml",
  "docs/unity-bridge.md", "unity/Runtime/AtlasPropEvent.cs", "unity/Runtime/AtlasPropLineParser.cs", "unity/Runtime/AtlasPropIntentRouter.cs"
  , "docs/affordable-mvp-feedback-loop.md"
];

for (const file of required) await access(resolve(root, file), constants.R_OK);

const diagram = JSON.parse(await readFile(resolve(root, "wokwi/diagram.json"), "utf8"));
const partIds = new Set(diagram.parts.map(part => part.id));
if (partIds.size !== diagram.parts.length) throw new Error("Duplicate Wokwi part IDs");
for (const [from, to] of diagram.connections) {
  for (const endpoint of [from, to]) {
    const id = endpoint.split(":")[0];
    if (!partIds.has(id)) throw new Error(`Connection references unknown part: ${id}`);
  }
}

const firmware = await readFile(resolve(root, "firmware/spell-orb/src/main.cpp"), "utf8");
for (const token of ["ATLAS_PROP_READY", '"PLAYER_INTENT"', '"CAST"', '"SPECIAL"']) {
  if (!firmware.includes(token.replaceAll('"', '\\"')) && !firmware.includes(token)) {
    throw new Error(`Firmware is missing ${token}`);
  }
}
const guardianFirmware = await readFile(resolve(root, "firmware/guardian-shield/src/main.cpp"), "utf8");
for (const token of ["guardian-shield-01", 'emitEvent("BLOCK_START"', 'emitEvent("BLOCK_END"', 'emitEvent("TAUNT"', "VibrationDriver"]) {
  if (!guardianFirmware.includes(token)) throw new Error(`Guardian firmware is missing ${token}`);
}
const guardianDiagram = JSON.parse(await readFile(resolve(root, "wokwi/guardian-diagram.json"), "utf8"));
const guardianPartIds = new Set(guardianDiagram.parts.map(part => part.id));
for (const requiredPart of ["esp", "imu", "trigger", "rim", "vibrationProxy"]) {
  if (!guardianPartIds.has(requiredPart)) throw new Error(`Guardian Wokwi diagram is missing ${requiredPart}`);
}

const app = await readFile(resolve(root, "dist/app.js"), "utf8");
for (const role of ["guardian", "warrior", "archer", "assassin", "mage", "boss"]) {
  if (!app.includes("  " + role + ": {")) throw new Error("Missing role build pack: " + role);
}
const guideMatch = app.match(/const guideSteps = \[([\s\S]*?)\n\];/);
const guideCount = guideMatch?.[1].match(/"(?:[^"\\]|\\.)*"/g)?.length ?? 0;
if (guideCount !== 32) throw new Error(`Expected 32 browser guide steps, found ${guideCount}`);
const viGuideMatch = app.match(/const guideStepsVi = \[([\s\S]*?)\n\];/);
const viGuideCount = viGuideMatch?.[1].match(/"(?:[^"\\]|\\.)*"/g)?.length ?? 0;
if (viGuideCount !== 32) throw new Error(`Expected 32 Vietnamese browser guide steps, found ${viGuideCount}`);
for (const token of ["const propKitVi", "const guidedCallouts", "function renderGuidedAssembly", "function renderGuidedVisual", "function guardianStepSvg", "const blueprintFocus", "atlas-language"]) {
  if (!app.includes(token)) throw new Error(`Missing bilingual guided-build feature: ${token}`);
}
const manifests = await readFile(resolve(root, "dist/prop-manifests.js"), "utf8");
for (const role of ["guardian", "warrior", "archer", "assassin", "mage", "boss"]) {
  if (!manifests.includes(`    ${role}: {`)) throw new Error(`Missing shared prop manifest: ${role}`);
}
for (const token of ["assemblyCallouts", "modelKey", "assets", "arc-bow-template-900mm.svg", "procurement", "priceVnd", "window.ATLAS_PROP_MANIFESTS"]) {
  if (!manifests.includes(token)) throw new Error(`Missing manifest contract token: ${token}`);
}
for (const token of ["const electronicsProfiles", "function electronicsDiagramSvg", "function testElectronicsEvent", "roleCircuitGraphic", "electronicsEventButtons"]) {
  if (!app.includes(token)) throw new Error(`Missing role electronics feature: ${token}`);
}

const html = await readFile(resolve(root, "dist/index.html"), "utf8");
for (const asset of ["styles.css", "prop-manifests.js", "app.js", "favicon.svg"]) {
  if (!html.includes(asset)) throw new Error(`HTML is missing ${asset}`);
}
for (const id of ["partsReadyCheck", "guidedStepNav", "guidedVisualTabs", "guidedVisualFrame", "guidedStepAction", "guidedStepPass", "roleProductionAssets"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`HTML is missing guided assembly control: ${id}`);
}
for (const id of ["roleCircuitGraphic", "electronicsEventButtons", "electronicsTestLog", "core-build-title", "guideList"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`HTML is missing electronics lab control: ${id}`);
}
for (const id of ["threePropStage", "explodeRange", "electronicsLayerToggle", "twinPartButtons", "threeArenaStage", "arenaRoleChips"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`HTML is missing Three.js digital-twin control: ${id}`);
}
for (const id of ["guardianProductionPack", "playerHeight", "forearmLength", "shieldDiameterResult", "guardianPurchaseList", "guardianGateList", "downloadGuardianProductionPack"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`HTML is missing Guardian production control: ${id}`);
}
for (const id of ["mvpSignalStage", "mvpStateBadge", "mvpTargetButtons", "mvpFireButton", "mvpEventLog"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`HTML is missing affordable MVP control: ${id}`);
}
for (const asset of ["downloads/guardian-template-500mm.svg", "downloads/guardian-rear-layout.svg"]) {
  if (!html.includes(asset)) throw new Error(`HTML is missing Guardian fabrication asset: ${asset}`);
}
for (const token of ["const guardianProduction", "function renderGuardianProduction", "function updateGuardianFit", "function downloadGuardianProductionPack", "atlas-guided-step-change"]) {
  if (!app.includes(token)) throw new Error(`Missing Guardian production feature: ${token}`);
}
for (const token of ["const mvpFeedbackCopy", "function beginMvpCharge", "function releaseMvpShot", "function selectMvpZone", "HIT_CONFIRMED"]) {
  if (!app.includes(token)) throw new Error(`Missing affordable MVP feedback feature: ${token}`);
}
const threeLab = await readFile(resolve(root, "dist/three-lab.js"), "utf8");
for (const token of ["buildGuardian", "buildSword", "buildBow", "buildDaggers", "buildStaff", "buildBoss", "plateGeometry", "ACESFilmicToneMapping", "atlas-field-action", "atlas-prop-change", "selectedByProp", "twinStateByProp", "persistTwinState", "refreshPropLabels", "selectPartManually", "baseOpacity"]) {
  if (!threeLab.includes(token)) throw new Error(`Missing Three.js digital-twin feature: ${token}`);
}
const unityParser = await readFile(resolve(root, "unity/Runtime/AtlasPropLineParser.cs"), "utf8");
const unityRouter = await readFile(resolve(root, "unity/Runtime/AtlasPropIntentRouter.cs"), "utf8");
for (const token of ["unsupported_version", "not_player_intent", "missing_required_field"]) {
  if (!unityParser.includes(token)) throw new Error(`Unity parser is missing rejection: ${token}`);
}
if (!unityRouter.includes("duplicate_or_stale_sequence")) throw new Error("Unity router is missing sequence deduplication");
if (html.includes('data-view="build"')) throw new Error("Legacy disconnected build tab still exists");

console.log("Atlas Prop Lab validation passed: Guardian production pack, 6 bilingual role packs, 6 Three.js digital twins, synchronized role electronics and arena replay, " + diagram.parts.length + " Wokwi proxy parts, " + diagram.connections.length + " wires, " + guideCount + " English + " + viGuideCount + " Vietnamese bench steps.");
