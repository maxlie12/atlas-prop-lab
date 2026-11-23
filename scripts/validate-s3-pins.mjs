import fs from "node:fs";
import vm from "node:vm";

// Every prop core is an MKE-K01 (ESP32-S3-WROOM-1 N4). Usable GPIOs exclude strapping pins
// (0, 3, 45, 46), native USB (19, 20), SPI flash/PSRAM (26–37), JTAG (39–42), UART0
// console (43, 44) and the on-board RGB LED (38/48). GPIO22–25 do not exist on the S3.
const usable = new Set([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 47]);
const adc1 = new Set([1, 2, 4, 5, 6, 7, 8, 9, 10]);
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const failures = [];
const check = (where, pin) => { if (!usable.has(pin)) failures.push(`${where}: GPIO${pin} is not usable on the ESP32-S3 core`); };

for (const firmware of ["firmware/spell-orb/src/main.cpp", "firmware/guardian-shield/src/main.cpp", "firmware/arc-bow/src/main.cpp", "firmware/impact-armour/src/main.cpp"]) {
  if (!fs.existsSync(new URL(`../${firmware}`, import.meta.url))) continue;
  const pins = read(firmware).match(/namespace Pins \{([\s\S]*?)\n\}/)?.[1] ?? "";
  for (const [, name, pin] of pins.matchAll(/constexpr uint8_t (\w+) = (\d+);/g)) check(`${firmware} Pins::${name}`, Number(pin));
  if (!/board = esp32-s3-devkitc-1/.test(read(firmware.replace("src/main.cpp", "platformio.ini")))) failures.push(`${firmware}: platformio board must be esp32-s3-devkitc-1`);
}

const app = read("dist/app.js");
const profiles = app.match(/const electronicsProfiles = (\{[\s\S]*?\n\});/)?.[1];
const pinMap = app.match(/const pinMap = (\[[\s\S]*?\n\]);/)?.[1];
if (!profiles || !pinMap) failures.push("dist/app.js: electronicsProfiles or pinMap not found");
else {
  const roles = vm.runInNewContext(`(${profiles})`);
  for (const [role, profile] of Object.entries(roles)) {
    for (const [label, en] of profile.pins) {
      for (const pin of label.match(/\d+/g)?.map(Number) ?? []) {
        if (/^GPIO/.test(label)) check(`electronicsProfiles.${role} "${en}"`, pin);
        if (/analog/i.test(en) && !adc1.has(pin)) failures.push(`electronicsProfiles.${role}: analog input GPIO${pin} is not on ADC1`);
      }
    }
  }
  for (const entry of vm.runInNewContext(`(${pinMap})`)) if (/^GPIO\d+$/.test(entry.pin)) check(`pinMap "${entry.name}"`, Number(entry.pin.slice(4)));
}

const wiring = read("dist/physical-wiring.js").match(/pins: \{([^}]*)\}/)?.[1] ?? "";
for (const [, name, pin] of wiring.matchAll(/(\w+): (\d+)/g)) {
  check(`physical-wiring default ${name}`, Number(pin));
  if (name === "hall" && !adc1.has(Number(pin))) failures.push(`physical-wiring: Hall GPIO${pin} is not on ADC1`);
}

for (const diagram of ["wokwi/diagram.json", "wokwi/guardian-diagram.json"]) {
  const json = JSON.parse(read(diagram));
  if (json.parts[0].type !== "board-esp32-s3-devkitc-1") failures.push(`${diagram}: board must be board-esp32-s3-devkitc-1`);
  for (const connection of json.connections) for (const end of connection.slice(0, 2)) {
    const match = /^esp:(\d+)$/.exec(end);
    if (match) check(diagram, Number(match[1]));
  }
}
for (const match of app.matchAll(/"esp:(\d+)"/g)) check("dist/app.js currentDiagram", Number(match[1]));

for (const [source, copy] of [["firmware/spell-orb/src/main.cpp", "dist/downloads/main.cpp"], ["wokwi/diagram.json", "dist/downloads/diagram.json"], ["docs/assembly-32-steps.md", "dist/downloads/assembly-32-steps.md"]]) {
  if (read(source) !== read(copy)) failures.push(`${copy} is out of date with ${source}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("S3 pin contract PASS: firmware, role profiles, wiring defaults and Wokwi diagrams use only usable ESP32-S3 GPIOs; download copies match their sources.");
