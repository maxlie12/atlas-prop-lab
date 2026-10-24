import fs from "node:fs";
import vm from "node:vm";

const context = { window: {} };
vm.createContext(context);
for (const name of ["prop-manifests.js", "build-graph.js"]) {
  vm.runInContext(fs.readFileSync(new URL(`../dist/${name}`, import.meta.url), "utf8"), context);
}
const graph = context.window.ATLAS_BUILD_GRAPH;
const manifests = context.window.ATLAS_PROP_MANIFESTS;
const armour = context.window.ATLAS_IMPACT_ARMOUR;
if (graph?.projectId !== "arc-bow-impact-armour-proof-01") throw new Error("Prototype build graph missing");
if (new Set(graph.components.map(item => item.id)).size !== graph.components.length) throw new Error("Duplicate component IDs");
for (const item of graph.components) {
  for (const field of ["purchase", "placement", "wiring", "test", "evidence"]) if (!item[field]) throw new Error(`${item.id} missing ${field}`);
  if (item.subsystem === "bow" && item.manifest.moduleId !== "ir-hit-emitter") {
    if (!manifests.archer.modules.some(module => module.id === item.manifest.moduleId)) throw new Error(`${item.id} links to unknown bow module`);
  }
  if (item.subsystem === "armour" && item.manifest.armourZoneIds) {
    for (const zone of item.manifest.armourZoneIds) if (!armour.zones.some(entry => entry.id === zone)) throw new Error(`${item.id} links to unknown armour zone`);
  }
}
console.log(`Build graph PASS: ${graph.components.length} linked components across purchase, placement, wiring, assembly, and proof.`);
