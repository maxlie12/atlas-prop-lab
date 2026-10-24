import fs from "node:fs";
import vm from "node:vm";
const source = fs.readFileSync(new URL("../dist/physical-kit.js", import.meta.url), "utf8");
const context = { window: {} }; vm.createContext(context); vm.runInContext(source, context);
const kit = context.window.ATLAS_PHYSICAL_KIT;
if (!kit || kit.parts?.length !== 9) throw new Error("Physical bench kit must define nine purchase/defer groups");
if (new Set(kit.parts.map(part => part.id)).size !== kit.parts.length) throw new Error("Physical kit IDs must be unique");
for (const part of kit.parts.filter(part => part.buyNow)) {
  if (!part.sources?.length || !part.verify?.vi || !part.verify?.en) throw new Error(`Purchase evidence missing: ${part.id}`);
}
for (const rule of ["3.3 V", "transistor driver", "invisible"]) if (!JSON.stringify(kit.rules).includes(rule)) throw new Error(`Safety rule missing: ${rule}`);
console.log("Physical kit PASS: nine groups, source links, bilingual receipt checks, and voltage/IR safety boundaries.");
