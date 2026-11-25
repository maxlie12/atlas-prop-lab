import fs from "node:fs";
import vm from "node:vm";

// Purchase data lives in several places (bench kit, Guardian manifest, role BOMs, docs).
// This keeps them telling the same story: one controller name and price, and the support
// parts that WS2812 LEDs and vibration motors need on a 3.3 V ESP32-S3.
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const failures = [];
const context = { window: {} };
vm.createContext(context);
vm.runInContext(read("dist/physical-kit.js"), context);
vm.runInContext(read("dist/prop-manifests.js"), context);

const kitBoard = context.window.ATLAS_PHYSICAL_KIT.parts.find(part => part.id === "bench-esp32-s3");
const manifestSource = read("dist/prop-manifests.js");
const manifestPrice = manifestSource.match(/id: "mke-k01-esp32-s3"[^\n]*priceVnd: \[(\d+), (\d+)\]/);
if (!kitBoard || !manifestPrice) failures.push("controller entry missing from physical-kit.js or prop-manifests.js");
else {
  // The bench kit accepts the cheaper ESP32-S3-DevKitC-1 clone or the MKE-K01 reference, so its
  // per-board range must contain the manifest's MKE-K01 price and name both boards.
  const [low, high] = kitBoard.priceVnd.map(total => total / kitBoard.qty);
  if (low > Number(manifestPrice[1]) || high < Number(manifestPrice[2])) failures.push(`controller unit price range ${low}–${high} does not contain the manifest MKE-K01 price ${manifestPrice.slice(1)}`);
  if (!/MKE-K01/.test(kitBoard.name.en) || !/ESP32-S3-DevKitC-1/.test(kitBoard.name.en)) failures.push("bench kit controller must name the MKE-K01 reference and the DevKitC-1 substitute");
}

const lists = {
  "dist/app.js commonPropBom + role BOMs": read("dist/app.js").match(/const commonPropBom = \[[\s\S]*?\n\];/)[0] + (read("dist/app.js").match(/bom: \[\[.*\]\]/g) || []).join("\n"),
  "dist/prop-manifests.js": manifestSource,
  "docs/bom.md": read("docs/bom.md"),
  "docs/guardian-purchase-ledger.md": read("docs/guardian-purchase-ledger.md")
};
for (const [name, text] of Object.entries(lists)) {
  if (/DevKit V1|"ESP32-S3 DevKit"/.test(text)) failures.push(`${name}: names a controller other than the MKE-K01 ESP32-S3 N4`);
  if (/WS2812/i.test(text) && !/74AHCT125/.test(text)) failures.push(`${name}: lists WS2812 LEDs without a 74AHCT125 level shifter`);
  if (/vibration motor|coin vibration/i.test(text) && !/2N2222/.test(text)) failures.push(`${name}: lists a vibration motor without a transistor driver`);
  if (/vibration motor|coin vibration/i.test(text) && !/1N4148/.test(text)) failures.push(`${name}: lists a vibration motor without a flyback diode`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Purchase consistency PASS: MKE-K01 reference (DevKitC-1 accepted on the bench) with consistent pricing; WS2812 lists carry a level shifter and motor lists carry a driver and flyback diode.");
